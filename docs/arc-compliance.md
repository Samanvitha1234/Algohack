# ARC Compliance Notes

## ARC-4

- Contract methods in:
  - `smart_contracts/prediction_market/contract.algo.ts`
  - `smart_contracts/oracle_registry/contract.algo.ts`
- Methods are exposed with `@abimethod` decorators.
- Method invocation paths in backend/frontend use ABI-type encoded arguments for uint64/string payloads.

## ARC-32 / ARC-56

- Deployment compiles TEAL artifacts from `smart_contracts/**/{approval,clear}.teal`.
- `scripts/deploy.ts` deploys both Prediction app and Oracle Registry app and prints env-safe IDs.
- ABI compatibility is validated by unit tests in `tests/abi.spec.ts`.

## Current practical compliance posture

- ARC-4 method surface: implemented.
- ARC-style ABI arg encoding in callers: implemented.
- Full auto-generated ARC-32/56 typed client pipeline: partial (documented next hardening step).
