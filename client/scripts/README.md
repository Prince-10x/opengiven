# Deployment Scripts

## Prerequisites

- Install the Stellar CLI:
  ```bash
  brew install stellar-cli
  # or
  cargo install stellar-cli
  ```

## Deploy to Testnet

```bash
# Make the script executable
chmod +x scripts/deploy.sh

# Deploy
./scripts/deploy.sh testnet dev
```

This will:
1. Create/fund a testnet account (`dev`)
2. Build the Soroban contract
3. Deploy to testnet
4. Initialize the contract
5. Generate TypeScript bindings

## Manual Deployment

### 1. Build the contract
```bash
cd contract
stellar contract build
```

### 2. Generate a keypair
```bash
stellar keys generate dev --network testnet --fund
```

### 3. Deploy
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello-world.wasm \
  --source-account dev \
  --network testnet
```

### 4. Initialize
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source-account dev \
  --network testnet \
  -- \
  init
```

### 5. Generate TypeScript bindings
```bash
stellar contract bindings typescript \
  --contract-id <CONTRACT_ID> \
  --output-dir packages/contract \
  --network testnet \
  --overwrite
```

### 6. Build bindings
```bash
cd packages/contract
npm install
npm run build
```
