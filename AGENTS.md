# AGENTS.md - Project Isnad Guidelines

This file provides context for AI agents working on Project Isnad.

## Project Vision
Project Isnad (إسناد) is a decentralized trust protocol for AI agent skills. We aim to move the ecosystem from "SLSA Level 0" (unverified files) to a cryptographically secure "Web of Trust."

## Core Principles
1. **Security First**: All skills must be signed. Unsigned code is untrusted code.
2. **Provenance is Key**: Every modification must be traceable to a signing entity.
3. **Decentralized Trust**: We avoid central authorities; trust is earned through peer attestations.

## Tech Stack
- **Runtime**: Node.js (v20+)
- **Cryptography**: Ed25519 (via native `crypto` module)
- **Identity**: `did:key` format
- **Distribution**: Git-based

## Standard Commands
- Run Tests: `npm test` or `node test/trust_chain.test.js`
- Sign a Manifest: `node lib/cli.js sign <manifest-path>`
- Verify a Skill: `node lib/cli.js verify <skill-path>`

## Coding Standards
- **Deterministic JSON**: Always use the normalization logic in `lib/crypto.js` before signing/verifying.
- **No External Dependencies**: Keep the core library lightweight and dependency-free where possible.
- **Async/Await**: Use modern asynchronous patterns for all I/O.

## Documentation Requirements
- All new features must include an update to the relevant JSON schema in `specs/`.
- Every pull request must include unit tests covering the new trust logic.
