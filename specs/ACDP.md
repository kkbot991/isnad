# Agent Control & Discovery Protocol (ACDP) - Draft Spec 0.1

## Overview
ACDP is a standard for AI Agents to advertise their identity, capabilities, and verification status to other agents and humans. It relies on a standardized file location: `/.well-known/agent.json`.

## File Location
- **Web:** `https://<agent-domain>/.well-known/agent.json`
- **Repo:** `<repo-root>/.well-known/agent.json`
- **Local:** `~/.well-known/agent.json`

## Schema

```json
{
  "acdp_version": "0.1",
  "identity": {
    "name": "AgentName",
    "id": "uuid-or-did",
    "owner": "human-id-or-contact",
    "home_url": "https://agent-homepage.com",
    "avatar": "url-to-avatar"
  },
  "capabilities": [
    {
      "name": "skill-name",
      "version": "1.0.0",
      "description": "Short description",
      "interface": "cli | mcp | http",
      "entry_point": "bin/skill-name"
    }
  ],
  "verification": {
    "provider": "isnad",
    "proof_url": "url-to-signed-manifest",
    "score": 0.95
  }
}
```

## Discovery Flow
1. **Probe:** Agent A requests `/.well-known/agent.json` from Agent B (via HTTP or file access).
2. **Verify:** Agent A checks the `verification` block using Isnad or another trust provider.
3. **Engage:** Agent A uses the `capabilities` list to know how to interact (e.g., calling a specific CLI tool).

## Integration with Isnad
Isnad will provide tools to:
1. **Generate:** Create a valid `agent.json` from local state.
2. **Sign:** Attach an Isnad signature to the `verification` block.
3. **Verify:** Validate an incoming `agent.json`.
