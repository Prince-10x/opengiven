# Opengive - Transparent Donation Tracker

A transparent donation tracker with campaign progress bars and a public donor leaderboard, built on the Stellar network.

## Overview

Opengive is a decentralized donation platform where:
- **Campaigns** are created on-chain with a fundraising goal
- **Donations** are recorded on the Stellar blockchain
- **Progress** is tracked with real-time progress bars
- **Leaderboard** shows top donors for each campaign
- **Activity feed** displays live events from contract interactions

## Features

- **Soroban Smart Contract** — Manages campaigns, donations, and leaderboard data on-chain
- **Wallet Integration** — Connect via Freighter browser extension
- **Real-Time Updates** — Automatic polling for campaign progress, donor leaderboard, and activity
- **Transaction Tracking** — Pending/success/failed status with explorer links
- **Event Feed** — Live activity from contract events
- **Dark Mode** — Built-in theme toggle
- **Responsive Design** — Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Blockchain**: Stellar Network, Soroban Smart Contracts
- **Wallet**: Freighter, @stellar/stellar-sdk
- **State**: TanStack Query, Zustand
- **Styling**: Tailwind CSS v4, next-themes

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_STELLAR_NETWORK` | Network name (`testnet` or `public`) |
| `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE` | Network passphrase |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | RPC endpoint |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract ID |

### 2. Wallet Setup

Install the [Freighter](https://freighter.app) browser extension for Chrome/Firefox/Edge.

1. Install Freighter from the official website
2. Create a new wallet or import existing
3. Switch to Testnet in Freighter settings
4. Fund your account using the [Stellar Lab](https://lab.stellar.org/) or Friendbot

### 3. Contract Deployment

See [scripts/README.md](./scripts/README.md) for deployment instructions.

### 4. Local Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build

```bash
bun run build
bun start
```

## Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables (from `.env.example`)
4. Deploy

## Project Structure

```
client/
├── src/
│   ├── app/              # Pages (Home, Dashboard, Campaigns, Activity, Transactions)
│   ├── components/       # Reusable components
│   │   ├── ui/           # shadcn/ui primitives
│   │   ├── CampaignCard.tsx
│   │   ├── CreateCampaignForm.tsx
│   │   ├── DonateModal.tsx
│   │   ├── EventFeed.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Navbar.tsx
│   │   ├── TransactionStatus.tsx
│   │   ├── WalletConnect.tsx
│   │   └── CampaignProgress.tsx
│   ├── hooks/            # React hooks
│   ├── lib/              # Utilities
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript types
├── scripts/              # Deployment scripts
├── packages/             # Generated contract bindings
└── public/               # Static assets

contract/
├── contracts/contract/
│   └── src/
│       ├── lib.rs        # Soroban smart contract
│       └── test.rs       # Contract tests
├── Cargo.toml
└── Makefile
```

## Smart Contract

The Opengive smart contract is written in Rust using the Soroban SDK. It provides:

- `init()` — Initialize the contract
- `create_campaign(title, description, goal)` — Create a new campaign
- `donate(campaign_id, donor, amount)` — Donate to a campaign
- `get_campaign(id)` — Get campaign details
- `get_all_campaigns()` — Get all campaigns
- `get_donors(id)` — Get donor leaderboard for a campaign
- `get_campaign_count()` — Get total number of campaigns

## License

MIT
