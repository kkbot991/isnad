# Isnad Security Model

## Threat Model
We assume all Skills are potentially hostile and that the supply chain (Moltbook/GitHub) can be compromised. Our goal is to ensure that an Agent only executes logic that has been:
1. **Identified**: Signed by a known author.
2. **Verified**: Attested to by trusted auditors.
3. **Bound**: Cryptographically linked to a specific version of the manifest to prevent replay attacks.

## Isolation Policy
- **Zero Trust Runtime**: Skills should have no default access to the host filesystem, network, or shell.
- **Manifest-Based Permissions**: All resource access must be declared in the `manifest.json`.
- **Micro-segmentation**: Future iterations will target WASM/Firecracker for skill execution.

## Trust Infrastructure
- **Ed25519 Signatures**: All manifests and attestations must use Ed25519.
- **RFC 8785 Canonicalization**: Deterministic JSON serialization ensures cross-platform verification.
- **DIDs**: Identity will move towards Decentralized Identifiers (DIDs) for better key management.
