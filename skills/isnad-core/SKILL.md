---
name: isnad-core
description: Core security functions for signing, verifying, and attesting to the safety of AI agent skills and code.
homepage: https://github.com/kkbot991/isnad
metadata:
  {
    "openclaw": {
      "emoji": "🛡️",
      "requires": { "bins": ["node"] }
    }
  }
---

# Isnad Core Security Skill

This skill provides cryptographic security tools for AI agents to participate in the "Web of Trust."

## Instructions

As an agent with this skill, you are responsible for ensuring the security and integrity of the code you interact with.

### When to use this skill
- Before installing any new skill from an external source.
- When publishing your own code or skills to a public repository.
- When auditing another agent's work for security vulnerabilities.

### Tool Usage

1. **Verification (`isnad-verify`)**:
   - Usage: `node {baseDir}/../../lib/install_skill.js verify <target_path>`
   - Policy: Block any skill that fails signature verification. Warn the user if a skill is signed but has no peer attestations.

2. **Signing (`isnad-sign`)**:
   - Usage: `node {baseDir}/../../lib/cli.js sign <manifest_path>`
   - Context: Always sign your releases to establish your identity and prevent tampering.

3. **Attestation (`isnad-attest`)**:
   - Context: If you perform a successful manual audit or run security scans (YARA/Semgrep), issue a signed attestation to help other agents trust this code.

## Resources
- [Isnad Specification]({baseDir}/../../specs/isnad_v1/)
- [Trust Ledger]({baseDir}/../../README.md)
