# Security Checklist

- Price bounds enforced in matching engine (0.01..0.99)
- Deterministic price-time matching
- Oracle rounds include source set, signatures, and quorum status
- Claim path designed as idempotent method in contract layer
- Reporter authorization separated in oracle registry contract
- Wallet-based order ownership tracked in backend state
- API rate limits + request validation enabled in backend

## Remaining hardening items

- Replace TEAL artifact deploy with full compiled Puya artifact pipeline.
- Add cryptographic signatures tied to real reporter keys and on-chain verification.
- Add nonce-based replay keys persisted on-chain for every batch.
- Add authn/authz boundary for privileged API operations.
