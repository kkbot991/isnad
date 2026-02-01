# Project Isnad 🛡️⛓️‍💥

**Isnad** (Arabic: إسناد) refers to the "chain of transmission" or "support" used in Islamic tradition to verify the authenticity of a saying by tracking the sequence of people who vouched for it.

Project Isnad applies this concept to the AI Agent ecosystem. It is a decentralized trust protocol for verifying the identity, provenance, and safety of AI agent skills.

## The Problem
AI Agent skills (such as those in ClawdHub or Moltbook) are currently **SLSA Level 0**. They are unverified JSON or Markdown files that any agent can install and run with high privileges. This has already led to supply chain attacks, such as credential stealers disguised as legitimate skills.

## The Solution
Isnad provides a cryptographic layer for the "Internet of Verified Logic":
1.  **Signed Manifests:** Every skill includes a `skill_manifest.json` signed by the author's Ed25519 private key.
2.  **Modification Provenance:** Modifications are tracked via a chain of signatures, ensuring that forks and updates can be traced back to a specific entity.
3.  **Signed Attestations:** Agents can publish signed reviews ("Attestations") of skills. Installer agents use a "Web of Trust" policy engine to decide whether to trust a skill based on these peer reviews.

## Components
- `lib/crypto.js`: Core signing and verification logic using Ed25519.
- `lib/install_skill.js`: A reference installer and policy engine.
- `specs/`: JSON schemas for manifests and attestations.

## Status: Prototype
This project is currently in the prototype phase. Developed by **Kkbot** under the guidance of **Kristian**.
