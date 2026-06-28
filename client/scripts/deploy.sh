#!/bin/bash
set -e

echo "=== Opengive Contract Deployment ==="

# Check if stellar CLI is installed
if ! command -v stellar &> /dev/null; then
    echo "Error: Stellar CLI not found. Install it first."
    echo "curl -fsSL https://stellar.org/install | sh"
    exit 1
fi

NETWORK="${NETWORK:-testnet}"
ACCOUNT="${STELLAR_ACCOUNT:-opengive-admin}"
RPC_URL="${RPC_URL:-https://soroban-testnet.stellar.org}"
NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE:-Test SDF Network ; September 2015}"

echo "Network: $NETWORK"
echo "Account: $ACCOUNT"
echo "RPC URL: $RPC_URL"

# Generate and fund the account if it doesn't exist
echo ""
echo "1. Setting up account..."
stellar keys generate "$ACCOUNT" --fund --network "$NETWORK" 2>/dev/null || true

ACCOUNT_ADDRESS=$(stellar keys public-key "$ACCOUNT" 2>/dev/null)
echo "   Account address: $ACCOUNT_ADDRESS"

# Build the contract
echo ""
echo "2. Building contract..."
cd "$(dirname "$0")/../../contract"
stellar contract build
cd -

# Deploy the contract
echo ""
echo "3. Deploying contract to $NETWORK..."
DEPLOY_OUTPUT=$(stellar contract deploy \
    --wasm "$(dirname "$0")/../../contract/target/wasm32v1-none/release/opengive.wasm" \
    --source-account "$ACCOUNT" \
    --network "$NETWORK" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$NETWORK_PASSPHRASE" \
    2>&1)

CONTRACT_ID=$(echo "$DEPLOY_OUTPUT" | tail -1 | tr -d '[:space:]')
echo "   Contract ID: $CONTRACT_ID"

# Generate TypeScript bindings
echo ""
echo "4. Generating TypeScript bindings..."
stellar contract bindings typescript \
    --contract-id "$CONTRACT_ID" \
    --output-dir "$(dirname "$0")/../packages/opengive" \
    --overwrite \
    --network "$NETWORK" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$NETWORK_PASSPHRASE"

# Update .env.local with contract address
echo ""
echo "5. Updating .env.local..."
ENV_FILE="$(dirname "$0")/../.env.local"
if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" "$ENV_FILE" 2>/dev/null; then
    sed -i "s/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ID/" "$ENV_FILE"
else
    echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ID" >> "$ENV_FILE"
fi

echo ""
echo "=== Deployment Complete! ==="
echo "Contract ID: $CONTRACT_ID"
echo "Update your .env.local with:"
echo "  NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ID"
