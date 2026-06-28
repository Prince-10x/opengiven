# Opengive — Transparent Donation Tracker

A decentralized donation tracking platform built on the **Stellar** blockchain using **Soroban smart contracts**. Every donation is recorded on-chain, providing full transparency with real-time campaign progress bars and a public donor leaderboard.

## Features

- 🎯 **Campaign Management** — Create fundraising campaigns with XLM goals and deadlines
- 💰 **On-Chain Donations** — Every donation is a Soroban contract interaction
- 📊 **Progress Bars** — Real-time campaign fundraising progress
- 🏆 **Public Leaderboard** — Top donors ranked by total donations
- 🔔 **Activity Feed** — Live event stream from contract interactions
- 📜 **Transaction History** — Track pending, successful, and failed transactions
- 🔗 **Explorer Links** — Every transaction links to Stellar Expert
- 🌙 **Dark Mode** — Light/dark theme support
- 👛 **Multi-Wallet** — Connect with Freighter, XBull, Albedo, and more via StellarWalletsKit

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Stellar (Soroban Smart Contracts) |
| **Smart Contract** | Rust + soroban-sdk v25 |
| **Frontend** | Next.js 15 + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui + Radix Primitives |
| **Wallet** | StellarWalletsKit |
| **Data Fetching** | TanStack Query |
| **State Management** | Zustand |
| **Icons** | Lucide React |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Bun](https://bun.sh/) (package manager)
- [Rust](https://rustup.rs/) (for contract development)
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli) (for deployment)
- [Freighter Wallet](https://freighter.app/) browser extension

## Setup

### 1. Clone and install dependencies

```bash
# Install client dependencies
cd client
bun install

# Build the contract (requires Rust)
cd ../contract
cargo build
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ADDRESS=CCONTRACT_ADDRESS_HERE
```

### 3. Wallet setup

Install the [Freighter Wallet](https://freighter.app/) browser extension and switch to Testnet.

### 4. Contract deployment

```bash
# Make sure the Stellar CLI is installed
# Set up your account and deploy
cd client
./scripts/deploy.sh

# Or manually:
cd ../contract
stellar contract build
stellar keys generate opengive-admin --fund --network testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/opengive.wasm \
  --source-account opengive-admin \
  --network testnet
```

After deployment, update `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local` with the returned contract ID (starts with `C...`).

### 5. Start the development server

```bash
cd client
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Generate TypeScript bindings (optional but recommended)

```bash
stellar contract bindings typescript \
  --contract-id <CONTRACT_ADDRESS> \
  --output-dir packages/opengive \
  --network testnet
```

Then add `"opengive": "file:packages/opengive"` to `package.json` dependencies and run `bun install`.

## Project Structure

```
├── client/                    # Next.js frontend
│   ├── app/                   # App router pages
│   ├── components/            # React components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities & contract helpers
│   ├── store/                 # Zustand state stores
│   ├── types/                 # TypeScript types
│   ├── scripts/               # Deployment scripts
│   ├── packages/              # Generated contract bindings
│   └── public/                # Static assets
├── contract/                  # Soroban workspace
│   ├── contracts/contract/    # Opengive contract
│   │   └── src/
│   │       ├── lib.rs         # Contract logic
│   │       └── test.rs        # Unit tests
│   └── Cargo.toml
└── README.md
```

## Contract Functions

| Function | Description |
|----------|-------------|
| `create_campaign` | Create a new fundraising campaign |
| `donate` | Donate XLM to a campaign |
| `get_campaign` | Get campaign details and progress |
| `get_campaign_donors` | Get list of donors for a campaign |
| `get_leaderboard` | Get top donors across all campaigns |
| `get_campaigns` | Get all campaign IDs |
| `close_campaign` | Close a campaign (admin only) |

## Smart Contract Tests

```bash
cd contract
cargo test
```

## Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables from `.env.example`
4. Deploy!

## Transaction Tracking

The app provides real-time transaction status tracking:

- **Pending** — Transaction submitted, waiting for confirmation
- **Success** — Transaction confirmed on-chain
- **Failed** — Transaction failed (click for details)

Every transaction links to [Stellar Expert](https://stellar.expert/) for full details.

## Architecture

```
User Wallet (Freighter/XBull)
       ↕
  Next.js Frontend
       ↕
  Stellar RPC (Soroban)
       ↕
  Opengive Smart Contract
       ↕
  Stellar Ledger (Campaigns, Donations, Leaderboard)
```

## License

MIT
