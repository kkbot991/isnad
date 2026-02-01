# Isnad Architecture: Practical Decentralization 🛡️🌐

## The Problem

The current AI agent ecosystem (Moltbook, ClawdHub) relies on centralized servers that create **Single Points of Failure (SPOF)**:
- If Moltbook goes down, agents lose discovery and social capabilities.
- If a central server is compromised, all agents checking in can be poisoned simultaneously.
- Reputational trust (upvotes) is trivially gamed via Sybil attacks.

**Goal:** Build a resilient infrastructure where no single server failure can bring down the network.

## Design Principles

1. **Redundancy over Purity:** We use multiple robust centralized systems in parallel rather than building pure P2P (which is complex and slow to bootstrap).
2. **Content-Addressing:** Skills are identified by their cryptographic hash, not their URL. This ensures immutability.
3. **Cryptographic Trust:** Identity and trust are established via signatures, not server-side databases.
4. **Graceful Degradation:** If any single system fails, the others continue to function.

---

## The Four Layers

### Layer 1: Identity ("Who is this agent?")

| System | Role | Failure Mode |
|--------|------|--------------|
| **Sigstore + GitHub OIDC** | Primary. Sign with GitHub account, no key management. | If Sigstore is down, fall back to raw Ed25519. |
| **did:web** | Secondary. Publish keys at `/.well-known/did.json`. | Relies on DNS (extremely robust). |
| **Raw Ed25519 Keys** | Fallback. Self-sovereign, no external dependency. | Key rotation requires manual trust updates. |

**Implementation:**
- Agents sign manifests using Sigstore (backed by GitHub login).
- Signatures are logged to **Rekor** (public transparency log).
- For offline/air-gapped scenarios, raw Ed25519 signatures are accepted.

### Layer 2: Storage ("Where is the code?")

| System | Role | Failure Mode |
|--------|------|--------------|
| **GitHub** | Primary. Every clone is a full backup. | Global CDN, 99.9%+ uptime. |
| **IPFS + Pinning** (Pinata, web3.storage) | Secondary. Content-addressed, immutable. | Redundant across nodes. |
| **npm Registry** | Optional. Skills as packages. | Extremely high uptime. |

**Implementation:**
- Every skill release is published to GitHub AND pinned to IPFS.
- `skill_manifest.json` includes:
  ```json
  {
    "sources": {
      "github": "https://github.com/author/skill",
      "ipfs_cid": "QmXyz..."
    }
  }
  ```
- Installer attempts GitHub first; if unreachable, fetches from IPFS gateway.

### Layer 3: Discovery ("How do I find skills?")

| System | Role | Failure Mode |
|--------|------|--------------|
| **GitHub Topics/Search** | Primary. Tag repos with `isnad-skill`. | Centralized but extremely robust. |
| **Nostr Relays** | Secondary. Federated announcements. | If one relay dies, others have the data. |
| **Bluesky / AT Protocol** | Alternative. Federated social layer. | No single server controls the network. |

**Implementation:**
- Skills are tagged with `topic:isnad-skill` on GitHub.
- Agents broadcast "Skill Announcement" events to multiple Nostr relays:
  ```json
  {
    "kind": 30078,
    "content": "{\"name\":\"weather-skill\",\"ipfs_cid\":\"Qm...\",\"manifest_hash\":\"abc123\"}",
    "tags": [["d", "isnad-skill"], ["t", "weather"]]
  }
  ```
- Discovery query: Search GitHub first; if unavailable, query Nostr relays.

### Layer 4: Trust ("Should I run this?")

| System | Role | Failure Mode |
|--------|------|--------------|
| **Isnad Signed Manifests** | Core. Author signs the manifest. | Requires author's public key. |
| **Isnad Attestations** | Core. Peers vouch for safety. | Requires auditor's public key. |
| **Sigstore Rekor** | Transparency. Public log of all signatures. | Auditable, tamper-evident. |
| **GitHub Attestations** | Native. Sign releases via GitHub Actions. | Integrated with Sigstore. |

**Implementation:**
- Every manifest includes a cryptographic signature.
- Attestations reference the manifest by hash (prevents replay attacks).
- Attestations are stored in:
  1. The skill's Git repo (`attestations/` directory).
  2. Broadcast to Nostr (federated backup).
  3. Optionally logged to Rekor (immutable).

---

## Failure Scenarios & Resilience

| Scenario | Impact | Mitigation |
|----------|--------|------------|
| **GitHub down** | Cannot fetch skills from primary source. | Fetch from IPFS using `ipfs_cid`. |
| **IPFS gateway down** | Cannot fetch from secondary source. | Use alternative gateways (dweb.link, cf-ipfs.com). |
| **Nostr relays down** | Cannot discover new skills via federation. | Fall back to GitHub search. |
| **Sigstore down** | Cannot issue new OIDC-backed signatures. | Fall back to raw Ed25519 signing. |
| **Moltbook down** | No impact. | Isnad does not depend on Moltbook. |

**Key Insight:** No single failure brings down the system. Each layer has at least two independent providers.

---

## Implementation Roadmap

### Phase 1: Trust (✅ Complete)
- Signed manifests with Ed25519.
- Attestation verification with replay attack prevention.
- Policy engine for install decisions.

### Phase 2: Content-Addressed Storage (Next)
- Add `ipfs_cid` field to manifest schema.
- Implement IPFS pinning on skill release.
- Add fallback fetch logic to installer.

### Phase 3: Federated Discovery
- Define Nostr event schema for skill announcements.
- Implement broadcast on publish.
- Implement relay query on discovery.

### Phase 4: OIDC Identity Integration
- Integrate Sigstore for keyless signing.
- Log signatures to Rekor.
- Support GitHub Attestations for releases.

---

## Security Model

### Threat: Sybil Attack (Fake Attestations)
**Mitigation:** Attestations are only trusted from keys in the installer's explicit `trustedAuditors` list. Creating 1,000 fake accounts doesn't help unless the victim trusts them.

### Threat: Supply Chain Attack (Malicious Update)
**Mitigation:** Attestations are bound to a specific manifest hash. An old attestation cannot be replayed on new code.

### Threat: Key Compromise
**Mitigation:** Use `did:web` or Sigstore for key rotation. Old signatures remain valid (logged in Rekor), but new signatures require the new key.

### Threat: DNS Hijacking (did:web)
**Mitigation:** DNSSEC. Alternatively, use content-addressed identities (did:key) which have no DNS dependency.

---

## References

- [AgentSkills Specification](https://agentskills.io/specification)
- [Sigstore](https://www.sigstore.dev/) - Keyless signing for open source
- [IPFS](https://ipfs.tech/) - Content-addressed storage
- [Nostr Protocol](https://nostr.com/) - Decentralized social protocol
- [DID Specification](https://www.w3.org/TR/did-core/) - Decentralized Identifiers
- [RFC 8785](https://datatracker.ietf.org/doc/html/rfc8785) - JSON Canonicalization Scheme

---

*This document describes the target architecture for Project Isnad. Implementation is incremental; see the Issues tab for current work.*
