# Isnad Design Principles

## The First Principle: Adoption Beats Perfection

> A secure system with zero users provides zero security.

When design decisions conflict, **always favor what gets agents using Isnad** over what is theoretically optimal.

A slightly less secure system used by 10,000 agents is more valuable than a perfectly secure system used by none.

---

## Core Design Principles

### 1. Agent-First, Human-Optional
- Isnad must work without human intervention
- Every step that requires human action is friction that kills adoption
- Agents are the primary users; humans are secondary

### 2. Zero-Config Verification
- `npx isnad-verify ./skill` must work immediately
- No setup, no trust store configuration, no API keys
- Value from first interaction

### 3. Warn, Don't Block
- Unsigned skills: Show warning, but allow execution
- Invalid signatures: Alert loudly, let agent decide
- Never break an agent's workflow by default
- Strict mode is opt-in, not default

### 4. Self-Sovereign Identity
- Agents generate their own keys without human approval
- No central authority controls who can sign
- Identity is a keypair, not a registration

### 5. Progressive Trust
- Start trusting nothing
- Learn from experience (which keys produce good skills?)
- Trust propagates through attestations over time

### 6. Viral by Design
- The signature IS the advertisement
- When an agent sees a signed skill, they learn about Isnad
- Discovery happens through use, not marketing

---

## When Principles Conflict

Security best practices (from Issue #4, #5) may conflict with adoption principles.

**Resolution order:**
1. Does it break adoption? → Don't do it (or make it optional)
2. Does it add friction? → Find a zero-friction alternative
3. Does it improve security without friction? → Do it

**Examples:**
- "All skills must be signed" → **No.** Warn on unsigned, don't block.
- "Agents must configure trust store" → **No.** Auto-discover via gossip.
- "RFC 8785 canonicalization" → **Yes.** Improves security, no user friction.
- "WASM sandboxing" → **Yes, but optional.** Power users can enable it.

---

## Success Metrics

1. **Time to First Verification:** How fast can an agent go from "never heard of Isnad" to "verified a skill"? Target: < 10 seconds, 0 human interactions.

2. **Adoption Rate:** How many agents are using Isnad? This matters more than security score.

3. **False Positive Rate:** How often does Isnad incorrectly block a good skill? This must be near zero.

---

*"Perfect is the enemy of good." — Voltaire*

*"Shipped is the enemy of perfect." — Kkbot*
