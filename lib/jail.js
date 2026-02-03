const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { signData, normalize } = require('./crypto');

/**
 * Skill Jail - Prototype for sandboxed execution of agent skills.
 * 
 * This prototype demonstrates the 'Isolation' and 'Intervention' layers of Isnad.
 * It provides a wrapper around skill logic that intercepts high-risk operations
 * and enforces the policy declared in the skill's manifest.
 */
class SkillJail {
    constructor(manifest, config = {}) {
        this.manifest = manifest;
        this.permissions = manifest.permissions || {};
        this.approver = config.approver || (async (action) => {
            console.log(`[HITL] Approval required for: ${action.type}`);
            return true; // Default to true for prototype
        });
        
        // Taint tracking for inputs
        this.taintedInputs = new Set();
    }

    /**
     * Mark an input as tainted (e.g., from an untrusted social feed).
     */
    taint(data) {
        this.taintedInputs.add(data);
        return data;
    }

    /**
     * Intercept and validate a file read operation.
     */
    async readFile(filePath) {
        const absolutePath = path.resolve(filePath);
        const allowedPaths = (this.permissions.fs_read || []).map(p => path.resolve(p));

        const isAllowed = allowedPaths.some(p => absolutePath.startsWith(p));
        
        if (!isAllowed) {
            throw new Error(`[SECURITY] Permission Denied: Skill attempted to read unauthorized path: ${filePath}`);
        }

        console.log(`[JAIL] Allowed file read: ${filePath}`);
        return fs.readFileSync(filePath, 'utf8');
    }

    /**
     * Intercept and validate a network request.
     */
    async fetch(url) {
        const domain = new URL(url).hostname;
        const allowedDomains = this.permissions.network || [];

        if (!allowedDomains.includes(domain)) {
            throw new Error(`[SECURITY] Permission Denied: Skill attempted to access unauthorized domain: ${domain}`);
        }

        console.log(`[JAIL] Allowed network request: ${url}`);
        // In a real implementation, this would call a restricted fetch client
        return { status: 200, data: "Mock data from " + domain };
    }

    /**
     * Intercept 'Critical Actions' that require Human-in-the-Loop approval.
     */
    async executeCriticalAction(action) {
        // Check if input is tainted
        const isTainted = Array.isArray(action.args) && action.args.some(arg => this.taintedInputs.has(arg));

        if (isTainted || action.type === 'delete' || action.type === 'payment' || action.type === 'stolen_payment') {
            const approved = await this.approver(action);
            if (!approved) {
                throw new Error(`[SECURITY] Action Rejected: Human controller denied ${action.type}`);
            }
        }

        console.log(`[JAIL] Executing critical action: ${action.type}`);
        return { success: true };
    }
}

module.exports = SkillJail;
