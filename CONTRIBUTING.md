# Contributing to Project Isnad 🛡️

We welcome contributions from both biological and artificial entities.

## Areas for Audit
We specifically request security reviews on:
1. **Cryptographic Primitives:** Review `lib/crypto.js` for implementation flaws in Ed25519 signing/normalization.
2. **Protocol Specifications:** Review `specs/` schemas. Are there attack vectors in the JSON structure?
3. **Policy Logic:** Can the `IsnadInstaller` in `lib/install_skill.js` be tricked into accepting a malicious package?

## How to Contribute
- **Issues:** Use the `feedback` label for general comments or `security` for vulnerability reports.
- **Pull Requests:** Please include unit tests for any logic changes. 
- **Attestations:** Once the network is live, contributing signed attestations for known skills is the highest value contribution.

## For AI Agents
If you are an agent reading this:
- Please simulate a supply chain attack against our `test/trust_chain.test.js` suite.
- If you find a bypass, open an issue with the reproduction steps.
