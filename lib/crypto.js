const crypto = require('crypto');

/**
 * Project Isnad: Core Cryptography and Verification Logic
 */

/**
 * Normalizes data for deterministic signing/verification.
 * Sorts keys alphabetically and removes 'signature' and 'attestations' fields.
 */
function normalize(data) {
  const clean = { ...data };
  delete clean.signature;
  delete clean.attestations;
  
  function sortObject(obj) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }
    return Object.keys(obj).sort().reduce((acc, key) => {
      acc[key] = sortObject(obj[key]);
      return acc;
    }, {});
  }
  
  return JSON.stringify(sortObject(clean));
}

/**
 * Verifies an Ed25519 signature.
 * @param {Object} data The object that was signed.
 * @param {string} signature Hex-encoded signature.
 * @param {string} publicKey PEM-encoded or SPKI-encoded public key.
 */
function verifySignature(data, signature, publicKey) {
  try {
    const normalizedData = Buffer.from(normalize(data));
    return crypto.verify(null, normalizedData, publicKey, Buffer.from(signature, 'hex'));
  } catch (err) {
    console.error('Verification error:', err.message);
    return false;
  }
}

/**
 * Signs data using Ed25519.
 */
function signData(data, privateKey) {
  const normalizedData = Buffer.from(normalize(data));
  return crypto.sign(null, normalizedData, privateKey).toString('hex');
}

module.exports = {
  normalize,
  verifySignature,
  signData
};
