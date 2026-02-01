const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { verifySignature, normalize } = require('./crypto');

/**
 * Logic for verifying a skill package.
 */
class IsnadInstaller {
  constructor(config = {}) {
    this.trustedAuthors = config.trustedAuthors || []; // List of public keys
    this.trustedAuditors = config.trustedAuditors || []; // List of public keys
    this.policy = config.policy || {
      requireAttestation: false,
      minAttestations: 0
    };
  }

  /**
   * Validates a skill manifest and its attestations.
   * @param {Object} packageData - The full package object { manifest, attestations }
   */
  async verifySkill(packageData) {
    const { manifest, attestations = [] } = packageData;
    const results = {
      validSignature: false,
      authorTrusted: false,
      validAttestations: [],
      policyPassed: false,
      errors: []
    };

    if (!manifest || !manifest.signature) {
      results.errors.push('Manifest missing signature.');
      return results;
    }

    // 1. Verify Author Signature
    // In a real DID scenario, we would resolve manifest.identity.author_id to a public key.
    // For this prototype, we expect a public key to be provided or known.
    const authorPublicKey = this.resolvePublicKey(manifest.identity.author_id);
    if (!authorPublicKey) {
      results.errors.push(`Could not resolve public key for author: ${manifest.identity.author_id}`);
    } else {
      results.validSignature = verifySignature(manifest, manifest.signature, authorPublicKey);
      results.authorTrusted = this.trustedAuthors.includes(authorPublicKey);
    }

    // 2. Verify Attestations
    // Calculate the hash of the CURRENT manifest for replay attack prevention
    const currentManifestHash = crypto.createHash('sha256').update(normalize(manifest)).digest('hex');

    for (const att of attestations) {
      const auditorKey = this.resolvePublicKey(att.auditor_id);
      if (auditorKey) {
        const isValid = verifySignature(att, att.signature, auditorKey);
        if (isValid) {
          // CRITICAL: Verify attestation targets THIS EXACT manifest
          if (att.target && att.target.manifest_hash) {
            if (att.target.manifest_hash !== currentManifestHash) {
              // Attestation was signed for a DIFFERENT version - potential replay attack!
              results.errors.push(`Attestation replay detected! Expected: ${currentManifestHash.substring(0,16)}..., Got: ${att.target.manifest_hash.substring(0,16)}...`);
              continue; // Reject this attestation
            }
          }
          
          results.validAttestations.push({
            auditor_id: att.auditor_id,
            trusted: this.trustedAuditors.includes(auditorKey)
          });
        }
      }
    }

    // 3. Policy Check
    results.policyPassed = this.checkPolicy(results);

    return results;
  }

  // Simplified for prototype
  resolvePublicKey(id) {
    // In Isnad, this would use a DID resolver or a local trust store mapping.
    // Mock: if id starts with 'pem:', return the rest as the key.
    if (id.startsWith('-----BEGIN PUBLIC KEY-----')) return id;
    return null;
  }

  checkPolicy(results) {
    if (!results.validSignature) return false;
    
    if (this.policy.requireAttestation) {
      const trustedAtts = results.validAttestations.filter(a => a.trusted);
      if (trustedAtts.length < this.policy.minAttestations) return false;
    }

    return true;
  }
}

module.exports = IsnadInstaller;
