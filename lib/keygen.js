const crypto = require('crypto');

/**
 * Generates an Ed25519 keypair in PEM format.
 */
function generateKeypair() {
  return crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
}

module.exports = {
  generateKeypair
};
