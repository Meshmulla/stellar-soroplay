# SoroPlay Compiler Service

A small containerized service that compiles user-submitted **Soroban** contracts
(Rust) to optimized WebAssembly. The SoroPlay Next.js app proxies to it through
the `COMPILATION_SERVICE_URL` environment variable; when that variable is unset,
the app falls back to a mock WASM binary.

## API

### `POST /compile`

Request:

```json
{ "code": "#![no_std]\nuse soroban_sdk::{contract, contractimpl, ...};\n..." }
```

Responses:

| Status | Body | Meaning |
|--------|------|---------|
| `200` | `{ "success": true, "wasmBinary": number[], "size": number }` | Compiled WASM as a byte array |
| `400` | `{ "error": "<compiler diagnostics>" }` | Contract failed to compile |
| `408` | `{ "error": "Build timed out" }` | Build exceeded `BUILD_TIMEOUT_MS` |
| `413` | `{ "error": "Contract source too large" }` | Source exceeded 64 KB |

### `GET /health`

Returns `{ "ok": true }`.

## How it works

The request body only ever becomes `src/lib.rs`. The Cargo manifest
(`template/Cargo.toml`) is fixed, so a request cannot add dependencies or build
scripts. Builds:

- run **offline** (`CARGO_NET_OFFLINE=true`) against a Cargo cache that is
  pre-warmed at image-build time, so only the user's `lib.rs` is recompiled;
- are **serialized** (one at a time) because they share a single `target/` cache;
- are **killed after a timeout** (`BUILD_TIMEOUT_MS`, default 90s);
- are optimized with `wasm-opt -Oz`.

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `PORT` | `8080` | Port the server listens on |
| `BUILD_TIMEOUT_MS` | `90000` | Hard timeout per build |

## Local run

Requires Docker (the toolchain lives in the image):

```bash
docker build -t soroplay-compiler .
docker run --rm -p 8080:8080 soroplay-compiler
# then:
curl -s localhost:8080/health
```

Point the app at it by setting `COMPILATION_SERVICE_URL=http://localhost:8080/compile`
in the app's `.env.local`.

## Deploy

This directory is a self-contained deploy target (`Dockerfile` at its root).

### Railway

1. New Project → **Deploy from GitHub repo** → select `stellar-soroplay`.
2. In the service settings set **Root Directory** to `compiler-service` (so
   Railway uses this folder's `Dockerfile`).
3. Railway detects the `Dockerfile` and builds it. No start command needed
   (the image's `CMD` runs the server); it injects `PORT` automatically.
4. After it deploys, copy the public URL and set the app's
   `COMPILATION_SERVICE_URL` to `https://<your-service>.up.railway.app/compile`.

### Render

1. New → **Web Service** → connect the repo.
2. Set **Root Directory** to `compiler-service` and **Runtime** to **Docker**.
3. Health check path: `/health`.
4. Deploy, then set the app's `COMPILATION_SERVICE_URL` to
   `https://<your-service>.onrender.com/compile`.

## Notes / hardening

- Give the instance enough memory — a cold Rust compile of a Soroban contract is
  memory-hungry (a 1 GB+ instance is recommended). The pre-warmed cache keeps
  per-request builds light, but the very first build after a cold start is the
  heaviest.
- The container currently runs as root. For stronger isolation on a shared host,
  run it behind a per-request ephemeral sandbox (gVisor/Firecracker) or add a
  non-root user and tighter resource limits.
- Keep `soroban-sdk` in `template/Cargo.toml` roughly in step with the Stellar
  network's supported protocol; bump the version and rebuild the image to update.
