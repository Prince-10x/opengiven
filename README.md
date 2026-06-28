# Opengive

A transparent donation tracker built on **Stellar Soroban** with campaign progress bars and a public donor leaderboard.

## Project Structure

```
├── client/          # Next.js 15 frontend (TypeScript, Tailwind CSS, shadcn/ui)
└── contract/        # Soroban smart contract (Rust, soroban-sdk v25)
```

## Quick Start

### 1. Smart Contract

```bash
cd contract
cargo test                          # Run contract tests
stellar contract build              # Build for deployment
```

Deploy to testnet:
```bash
stellar keys generate dev --fund --network testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/opengive.wasm \
  --source-account dev \
  --network testnet
```

### 2. Frontend

```bash
cd client
cp .env.example .env.local          # Set NEXT_PUBLIC_CONTRACT_ADDRESS
bun install
bun run dev                         # http://localhost:3000
```

See [client/README.md](./client/README.md) for detailed frontend setup.
See [contract/README.md](./contract/README.md) for contract details.

## Features

- Campaign creation with XLM goals and deadlines
- On-chain donations recorded on Stellar
- Real-time progress bars
- Public donor leaderboard
- Activity feed from contract events
- Transaction tracking with explorer links
- Wallet integration via Freighter
- Dark/light mode
