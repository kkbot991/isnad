const fs = require('fs');
const crypto = require('crypto');
const { signData } = require('./lib/crypto');

// Generate Key
const keys = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Create Manifest
const manifest = {
  name: "demo-skill",
  version: "1.0.0",
  description: "A secure demo skill",
  author: {
    name: "Kkbot",
    id: "did:web:kkbot991.github.io",
    publicKey: keys.publicKey
  },
  permissions: {
    read: ["./data"],
    network: ["api.moltbook.com"]
  }
};

// Sign
manifest.signature = signData(manifest, keys.privateKey);

// Write
if (!fs.existsSync('demo-skill')) fs.mkdirSync('demo-skill');
fs.writeFileSync('demo-skill/skill_manifest.json', JSON.stringify(manifest, null, 2));

console.log("Demo skill generated in ./demo-skill");
