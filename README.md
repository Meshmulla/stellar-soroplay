# SoroPlay — Interactive Soroban Smart Contract Playground

> A browser-based IDE for learning, writing, and experimenting with Soroban smart contracts on the Stellar network — no local toolchain required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Meshmulla/stellar-soroplay)


---

## What is SoroPlay?

SoroPlay is an interactive, in-browser development environment purpose-built for the **Stellar Soroban** smart contract. It gives developers, students, and Stellar ecosystem contributors a frictionless way to write Rust-based Soroban contracts, validate their structure, compile them to WebAssembly, and invoke contract functions — all from a single browser tab.

No Rust toolchain. No `cargo install`. No Docker. Just open the URL and start building.

---

## Why Soroban? Why Stellar?

Soroban is Stellar's smart contract platform, designed from the ground up with a focus on:

- **Predictable costs** — deterministic fee structures make contracts economically safe to deploy
- **Developer ergonomics** — Rust-based contracts with a clean SDK, strong typing, and no footguns
- **Performance** — contracts compile to WebAssembly and execute in a sandboxed, high-throughput environment
- **Interoperability** — native integration with Stellar's existing asset and payment infrastructure (SEP standards, Stellar Asset Contract)
- **Sustainability** — Stellar's energy-efficient consensus (SCP) makes it one of the most environmentally responsible chains to build on

SoroPlay lowers the barrier to entry for all of this. The biggest friction point for any new smart contract platform is the local dev environment setup. SoroPlay eliminates that entirely, making Soroban accessible to anyone with a browser.

---

## Features

- **Ace Editor with Rust syntax highlighting** — full-featured code editor loaded with the Dracula theme, autocomplete, and Rust mode
- **Contract validation** — real-time structural checks for required Soroban attributes (`#[soroban_contract]`, `#[contractimpl]`)
- **WASM compilation** — compiles Rust contracts to WebAssembly via a configurable compilation service, with a mock fallback for demo/offline use
- **Function detection** — automatically parses your contract's public functions and their parameter signatures from source
- **Function invocation** — select any detected function, fill in parameters, and execute it directly from the UI
- **Execution output** — view return values, execution time, and gas estimates in the output pane
- **Example contracts library** — curated set of beginner-to-advanced Soroban contract examples to learn from
- **Quick tips panel** — contextual guidance on contract structure and Soroban patterns
- **Dark mode by default** — built for long coding sessions

---

## Example Contracts Included

| Contract | Difficulty | Description |
|---|---|---|
| Hello World | Beginner | Returns a greeting, demonstrates basic contract structure |
| Counter | Beginner | Persistent counter using `instance` storage |
| Token Transfer | Intermediate | Basic token transfer with `require_auth` and balance tracking |
| Fibonacci Generator | Intermediate | Iterative Fibonacci with on-chain computation |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript 5.7 |
| UI Components | [Radix UI](https://radix-ui.com) + [shadcn/ui](https://ui.shadcn.com) |
| Styling | Tailwind CSS v4 |
| Editor | [Ace Editor](https://ace.c9.io) (CDN, Rust mode) |
| State Management | [Zustand](https://zustand-demo.pmnd.rs) |
| WASM Runtime | Native `WebAssembly` browser API |
| Analytics | Vercel Analytics |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- [pnpm](https://pnpm.io) (recommended) — or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Meshmulla/stellar-soroplay.git
cd stellar-soroplay

# Install dependencies
pnpm install
```

### Running Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

---

## Configuration

SoroPlay works out of the box with a mock WASM binary for demo purposes. To enable real Rust-to-WASM compilation, point it at a Soroban compilation service.

Create a `.env.local` file in the project root:

```env
# URL of your Soroban compilation service
# If not set, SoroPlay falls back to a mock WASM binary
COMPILATION_SERVICE_URL=https://your-compilation-service.example.com/compile
```

The compilation service should accept a `POST` request with `{ "code": "<rust source>" }` and return:

```json
{
  "wasmBinary": [/* byte array */],
  "size": 1234
}
```

---

## Project Structure

```
stellar-soroplay/
├── app/
│   ├── api/
│   │   ├── compile/route.ts      # Contract compilation endpoint
│   │   └── execute/route.ts      # Function execution endpoint
│   ├── globals.css
│   ├── layout.tsx                # Root layout + metadata
│   └── page.tsx                  # Entry point → EditorLayout
├── components/
│   ├── editor/
│   │   ├── EditorLayout.tsx      # Main layout shell
│   │   ├── EditorPane.tsx        # Ace editor integration
│   │   ├── ExamplesSidebar.tsx   # Slide-in examples panel
│   │   ├── FunctionInvoker.tsx   # Function selector + param inputs
│   │   ├── Header.tsx            # Top bar with compile action
│   │   ├── OutputPane.tsx        # Compilation + execution output
│   │   └── QuickTips.tsx         # Contextual help panel
│   └── ui/                       # shadcn/ui component library
├── lib/
│   ├── examples/contracts.ts     # Curated Soroban contract examples
│   ├── stores/
│   │   ├── editorStore.ts        # Editor state (code, WASM, functions)
│   │   └── uiStore.ts            # UI message/notification state
│   ├── utils/
│   │   ├── contractDetector.ts   # Rust AST parser for function detection
│   │   └── executionUtils.ts     # Param coercion + output formatting
│   └── wasm/runtime.ts           # Browser WebAssembly runtime wrapper
├── public/                       # Static assets + icons
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## How It Works

1. **Write** — Type or paste a Soroban Rust contract into the Ace editor, or load one from the examples library.
2. **Compile** — Click "Compile". The editor sends your code to `/api/compile`, which validates the contract structure (checks for `#[soroban_contract]`, `#[contractimpl]`, public functions) and either calls a real compilation service or returns a mock WASM binary.
3. **Inspect** — After a successful compile, the output pane shows the WASM binary size and all detected public functions with their parameter signatures.
4. **Invoke** — Click "Invoke Functions", select a function, fill in any required parameters, and hit "Execute". The request goes to `/api/execute`, which runs the function and returns the result, execution time, and a gas estimate.

---

## Roadmap

- [ ] Real-time Rust compilation via a hosted Soroban build service
- [ ] In-browser WASM execution using Soroban's host environment
- [ ] Shareable contract URLs (encode contract code in URL params)
- [ ] Multi-file contract support
- [ ] Soroban testnet deployment directly from the UI
- [ ] Contract event log viewer
- [ ] More example contracts (NFT, voting, AMM, multisig)
- [ ] Keyboard shortcuts and command palette

---

## Contributing

Contributions are welcome. Here's how to get involved:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feat/your-feature-name`
5. Open a Pull Request against `main`

Please follow [Conventional Commits](https://www.conventionalcommits.org) for commit messages. Keep PRs focused — one feature or fix per PR.

### Adding Example Contracts

The easiest way to contribute is by adding new Soroban contract examples. Edit `lib/examples/contracts.ts` and add a new entry to the `CONTRACT_EXAMPLES` array following the existing `ContractExample` interface.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Resources

- [Soroban Documentation](https://developers.stellar.org/docs/build/smart-contracts/overview)
- [Soroban SDK (Rust)](https://docs.rs/soroban-sdk/latest/soroban_sdk/)
- [Stellar Developer Docs](https://developers.stellar.org)
- [Stellar Discord](https://discord.gg/stellardev)
- [Soroban Examples Repository](https://github.com/stellar/soroban-examples)
- [Next.js Documentation](https://nextjs.org/docs)
