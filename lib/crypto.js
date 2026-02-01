const crypto = require('crypto');

/**
 * Project Isnad: Core Cryptography and Verification Logic
 */

/**
 * RFC 8785 JSON Canonicalization Scheme (JCS) - Minimal Implementation
 * 
 * Ensures deterministic serialization across JavaScript engines by:
 * 1. Sorting object keys lexicographically (by UTF-16 code units)
 * 2. Removing 'signature' and 'attestations' fields before signing
 * 3. Handling numbers, strings, booleans, nulls, arrays, and objects
 * 4. Using minimal whitespace (no spaces, no newlines)
 * 
 * Note: This implementation handles the common cases. For full RFC 8785
 * compliance (including edge cases like -0, NaN, Infinity), consider
 * using a dedicated library in production.
 */
function normalize(data) {
  const clean = deepClone(data);
  delete clean.signature;
  delete clean.attestations;
  
  return canonicalize(clean);
}

/**
 * Deep clone to avoid mutating original object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  const cloned = {};
  for (const key of Object.keys(obj)) {
    cloned[key] = deepClone(obj[key]);
  }
  return cloned;
}

/**
 * RFC 8785 Canonicalization
 * Produces deterministic JSON output.
 */
function canonicalize(value) {
  if (value === null) return 'null';
  
  const type = typeof value;
  
  if (type === 'boolean') return value ? 'true' : 'false';
  
  if (type === 'number') {
    // Handle special cases per RFC 8785
    if (!Number.isFinite(value)) {
      throw new Error('RFC 8785: Cannot serialize Infinity or NaN');
    }
    // Use JavaScript's default number serialization (ES6 compliant)
    // This handles integers and floats correctly
    return Object.is(value, -0) ? '0' : String(value);
  }
  
  if (type === 'string') {
    // Escape control characters and quotes per JSON spec
    return JSON.stringify(value);
  }
  
  if (Array.isArray(value)) {
    const elements = value.map(canonicalize);
    return '[' + elements.join(',') + ']';
  }
  
  if (type === 'object') {
    // Sort keys lexicographically by UTF-16 code units
    const keys = Object.keys(value).sort((a, b) => {
      // Lexicographic comparison by code units
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    
    const pairs = keys
      .filter(key => value[key] !== undefined) // Skip undefined values
      .map(key => JSON.stringify(key) + ':' + canonicalize(value[key]));
    
    return '{' + pairs.join(',') + '}';
  }
  
  // undefined, functions, symbols are not valid JSON
  throw new Error(`RFC 8785: Cannot serialize type ${type}`);
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
