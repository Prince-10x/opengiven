#!/bin/bash
set -e

echo "=== Opengive Contract Deployment ==="
echo ""

# Configuration
NETWORK="${1:-testnet}"
ACCOUNT="${2:-dev}"
RPC_URL="https://soroban-${NETWORK}.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

if [ "$NETWORK" = "mainnet" ]; then
  RPC_URL="https://soroban.stellar.org"
  NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
fi

echo "Network: $NETWORK"
echo "Account: $ACCOUNT"
echo "RPC URL: $RPC_URL"
echo ""

# Generate and fund key if not exist
echo "1. Checking account..."
if ! stellar keys public-key "$ACCOUNT" 2>/dev/null; then
  echo "   Generating new key..."
  stellar keys generate "$ACCOUNT" --network "$NETWORK" --fund
fi

echo ""
echo "   Account public key: $(stellar keys public-key "$ACCOUNT")"

# Build contract
echo ""
echo "2. Building contract..."
cd "$(dirname "$0")/../../contract"
stellar contract build
echo "   Build complete"

# Deploy contract
echo ""
echo "3. Deploying contract..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello-world.wasm \
  --source-account "$ACCOUNT" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  | tr -d '\n')

echo "   Contract ID: $CONTRACT_ID"

# Initialize contract
echo ""
echo "4. Initializing contract..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account "$ACCOUNT" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- \
  init

echo "   Contract initialized"

# Generate TypeScript bindings
echo ""
echo "5. Generating TypeScript bindings..."
cd "$(dirname "$0")/../client"
stellar contract bindings typescript \
  --contract-id "$CONTRACT_ID" \
  --output-dir packages/contract \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  --overwrite

echo "   Bindings generated"

# Build the binding package
echo ""
echo "6. Building binding package..."
cd packages/contract
npm install
npm run build
cd ../..

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Contract Address: $CONTRACT_ID"
echo ""
echo "Add this to your .env file:"
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ID"
echo ""
