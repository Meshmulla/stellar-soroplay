// SoroPlay compiler service
// Compiles a user-submitted Soroban contract (Rust) to optimized WASM.
//
// POST /compile   { code: "<rust source for src/lib.rs>" }
//   200 -> { success: true, wasmBinary: number[], size: number }
//   400 -> { error: "<compiler diagnostics>" }
//   408 -> { error: "Build timed out" }
//   413 -> { error: "Contract source too large" }
// GET  /health    -> { ok: true }
//
// Safety model: the Cargo manifest is fixed (see template/Cargo.toml), so the
// request body only ever becomes src/lib.rs — no third-party deps or build
// scripts. Builds run offline (CARGO_NET_OFFLINE) against the pre-warmed cache,
// are killed after a timeout, and are serialized so one build cannot starve the
// shared template/target cache of another.

import express from 'express'
import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = path.join(__dirname, 'template')
const LIB_PATH = path.join(TEMPLATE_DIR, 'src', 'lib.rs')
const WASM_NAME = 'soroplay_contract.wasm'
const RAW_WASM = path.join(TEMPLATE_DIR, 'target', 'wasm32v1-none', 'release', WASM_NAME)
const OPT_WASM = RAW_WASM.replace(/\.wasm$/, '.optimized.wasm')

const MAX_CODE_BYTES = 64 * 1024
const BUILD_TIMEOUT_MS = Number(process.env.BUILD_TIMEOUT_MS) || 90_000
const PORT = process.env.PORT || 8080

const app = express()
app.use(express.json({ limit: '256kb' }))

// Run a child process, capturing output and enforcing a hard timeout.
function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, opts)
    let stdout = ''
    let stderr = ''
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGKILL')
    }, BUILD_TIMEOUT_MS)

    child.stdout?.on('data', (d) => (stdout += d))
    child.stderr?.on('data', (d) => (stderr += d))
    child.on('error', (err) => {
      clearTimeout(timer)
      resolve({ code: -1, timedOut, stdout, stderr: stderr || String(err) })
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code, timedOut, stdout, stderr })
    })
  })
}

// Strip cargo progress noise so the user sees actual compiler errors.
function cleanDiagnostics(stderr) {
  return stderr
    .split('\n')
    .filter((l) => !/^\s*(Compiling|Finished|Updating|Downloaded|Downloading|Blocking)\b/.test(l))
    .join('\n')
    .trim()
    .slice(0, 8000)
}

async function compile(code) {
  await fs.writeFile(LIB_PATH, code, 'utf8')

  const build = await run(
    'cargo',
    ['build', '--target', 'wasm32v1-none', '--release'],
    { cwd: TEMPLATE_DIR, env: { ...process.env, CARGO_NET_OFFLINE: 'true' } }
  )

  if (build.timedOut) {
    return { status: 408, body: { error: 'Build timed out' } }
  }
  if (build.code !== 0) {
    return { status: 400, body: { error: cleanDiagnostics(build.stderr) || 'Compilation failed' } }
  }

  // Best-effort size optimization with binaryen's wasm-opt.
  let wasmFile = RAW_WASM
  const opt = await run('wasm-opt', ['-Oz', '--strip-debug', '--strip-producers', RAW_WASM, '-o', OPT_WASM])
  if (opt.code === 0) wasmFile = OPT_WASM

  const bytes = await fs.readFile(wasmFile)
  return { status: 200, body: { success: true, wasmBinary: Array.from(bytes), size: bytes.length } }
}

// Serialize builds — a single shared template/target cache means only one
// cargo build can run at a time.
let queue = Promise.resolve()

app.post('/compile', (req, res) => {
  const code = req.body?.code
  if (typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'No code provided' })
  }
  if (Buffer.byteLength(code, 'utf8') > MAX_CODE_BYTES) {
    return res.status(413).json({ error: 'Contract source too large' })
  }

  queue = queue
    .then(() => compile(code))
    .then(({ status, body }) => res.status(status).json(body))
    .catch((err) => {
      console.error('[soroplay-compiler] build error:', err)
      if (!res.headersSent) res.status(500).json({ error: 'Internal build error' })
    })
})

app.get('/health', (_req, res) => res.json({ ok: true }))

// Surface malformed-JSON and other body-parser errors as 400s.
app.use((err, _req, res, _next) => {
  if (!res.headersSent) res.status(400).json({ error: err?.message || 'Bad request' })
})

app.listen(PORT, () => {
  console.log(`[soroplay-compiler] listening on :${PORT}`)
})
