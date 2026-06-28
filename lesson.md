# Opengive Project Lessons

## Soroban Contract

### Storage Pattern
- Use `env.storage().instance()` for global config (campaign counter, campaign ID list, donor list)
- Use `env.storage().persistent()` for per-campaign and per-donor data (campaigns, donations, donor totals)
- Storage keys use `&` references: `set(&key, &val)`, `get(&key)`
- Vec methods: `push_back()` (NOT `push()`), `contains(&item)`, `get(index)`, `iter()` (requires Clone)

### Map Pattern
- Map takes OWNED keys: `map.get(key.clone())`, NOT `map.get(&key)`

### Events
- `env.events().publish((symbol_short!("topic"),), (data1, data2))` - deprecated but functional
- New approach: `#[contractevent]` macro on event struct

### Testing
- `env.mock_all_auths()` - bypass auth in tests
- `Address::generate(&env)` requires `use soroban_sdk::testutils::Address as _;`
- `env.register(Contract, ())` - new API (not `register_contract`)
- `env.ledger().set_timestamp()` - for time-dependent tests
- Client is auto-named: `Opengive` → `OpengiveClient`
- `#[should_panic(expected = "msg")]` for panic-based error handling

## Stellar SDK v16

### Type Imports
- NOT `import { ScVal } from "@stellar/stellar-sdk"` - doesn't exist
- Use `type ScVal = xdr.ScVal` instead
- `rpc.Api.isSimulationError(sim)` - check simulation errors properly
- `SendTransactionResponse.status` has no `.error` - check `result.status === "ERROR"`

### Contract Interactions
- `Contract.call(method, ...args: ScVal[])` - pass ScVal objects directly
- `nativeToScVal()` with `{type: "string"|"u64"|"i128"|...}` for conversion
- For Address: `new Address(addr).toScVal()`

### ABI
- `TransactionBuilder.fromXDR(xdr, networkPassphrase)` - for deserializing signed TX
- `server.sendTransaction(envelope)` returns `{status, hash, ...}`
- `server.getTransaction(hash)` returns `{status: "SUCCESS"|"FAILED"|"NOT_FOUND"}`

## Stellar Freighter API v6
- Functions are direct imports: `isConnected()`, `isAllowed()`, `requestAccess()`, `getAddress()`, `signTransaction(xdr, opts)`
- `signTransaction` returns `{ signedTxXdr }`  not `{ signedTxXdr, signerAddress }`

## StellarWalletsKit v2.4
- Constructor takes no args - use `StellarWalletsKit.init({modules: [...], network, selectedWalletId})`
- Modules are classes: `new FreighterModule()`, etc. 
- Module imports are NOT exported in the package - use `@stellar/freighter-api` directly instead
- `StellarWalletsKit.authModal()` for wallet selection UI
- `StellarWalletsKit.signTransaction(xdr)` for signing
- `StellarWalletsKit.disconnect()` for cleanup

## Next.js 16 + Tailwind v4
- Custom variants use `@custom-variant dark (&:is(.dark *));`
- Theme inline uses `@theme inline { ... }`
- shadcn/ui radix primitives work with Tailwind v4
- Next.js App Router works with turbopack
