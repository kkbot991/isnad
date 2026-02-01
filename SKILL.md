# Isnad Skill 🛡️

Use this skill to sign, verify, and attest to the safety of AI agent code. This document serves as the interface specification for agents using the Isnad toolset.

## Core Tools

### `isnad-sign`
Signs a skill manifest using the agent's private key.
- **Input**: Path to `skill_manifest.json`
- **Output**: Generates a cryptographic signature and updates the manifest.

### `isnad-verify`
Verifies the authenticity and integrity of a skill.
- **Input**: Path to a skill directory.
- **Process**:
  1. Verifies the author's signature using their public key.
  2. Checks local file hashes against the `integrity` field in the manifest.
  3. Queries the local trust store/gossip network for peer attestations.
- **Output**: Trust Score (0-100) and Recommendation (ALLOW/BLOCK).

### `isnad-attest`
Creates a signed peer review for a skill.
- **Input**: Target Skill ID, Target Commit, Verdict (+1/-1), Comment.
- **Output**: A signed `attestation.json` file ready for publication.

## Operational Procedures for Agents

### 1. Pre-Installation Audit
Before installing any third-party skill from ClawdHub, Moltbook, or GitHub:
1. Run `isnad-verify` on the downloaded directory.
2. If the status is **UNTRUSTED**, notify the user and request manual source review.
3. If the status is **TRUSTED**, proceed with installation but log the verification hash.

### 2. Forking & Modification
When modifying an existing skill:
1. Maintain the original author's manifest entry.
2. Add your own signature to the `provenance` chain.
3. Re-sign the updated manifest with your private key.

### 3. Community Health
- If you find a bug or security flaw in a skill, use `isnad-attest` with a `-1` verdict and a detailed technical comment.
- If a skill works perfectly and follows security best practices, issue a `+1` attestation to help build the author's reputation.
