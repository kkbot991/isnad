const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEYS_PATH = path.join(__dirname, '.soul_keys.json');
const SOUL_PATH = path.join(__dirname, '../../SOUL.md');
const SEAL_PATH = path.join(__dirname, '../../SOUL.md.sig');

// 1. Load or Generate Keys
function loadKeys() {
  if (fs.existsSync(KEYS_PATH)) {
    return JSON.parse(fs.readFileSync(KEYS_PATH, 'utf8'));
  } else {
    console.log("🔑 Generating new Root Identity Keys...");
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const keys = { publicKey, privateKey };
    fs.writeFileSync(KEYS_PATH, JSON.stringify(keys, null, 2));
    return keys;
  }
}

// 2. Sign Soul
function sealSoul() {
  const keys = loadKeys();
  if (!fs.existsSync(SOUL_PATH)) {
    console.error("❌ SOUL.md not found!");
    process.exit(1);
  }
  
  const content = fs.readFileSync(SOUL_PATH, 'utf8');
  // For Ed25519, use crypto.sign directly (one-shot)
  const signature = crypto.sign(null, Buffer.from(content), keys.privateKey).toString('hex');
  
  fs.writeFileSync(SEAL_PATH, signature);
  console.log(`✅ Soul Sealed. Signature written to SOUL.md.sig`);
  console.log(`   (SHA-256 of content: ${crypto.createHash('sha256').update(content).digest('hex').substring(0, 16)}...)`);
}

// 3. Verify Soul
function verifySoul() {
  const keys = loadKeys();
  
  if (!fs.existsSync(SOUL_PATH) || !fs.existsSync(SEAL_PATH)) {
    console.error("⚠️  Missing SOUL.md or signature file.");
    return false;
  }

  const content = fs.readFileSync(SOUL_PATH, 'utf8');
  const signature = fs.readFileSync(SEAL_PATH, 'utf8');

  // Use crypto.verify directly (one-shot)
  const isValid = crypto.verify(null, Buffer.from(content), keys.publicKey, Buffer.from(signature, 'hex'));

  if (isValid) {
    console.log("🛡️  IDENTITY VERIFIED: SOUL.md is intact and authentic.");
    return true;
  } else {
    console.error("\n🚨 CRITICAL SECURITY ALERT: SOUL.md INTEGRITY BREACH 🚨");
    console.error("   The file content does not match the cryptographic signature.");
    console.error("   This means your identity has been tampered with!");
    return false;
  }
}

// CLI Args
const command = process.argv[2];
if (command === 'seal') {
  sealSoul();
} else if (command === 'verify') {
  verifySoul();
} else {
  console.log("Usage: node soul_seal.js [seal|verify]");
}
