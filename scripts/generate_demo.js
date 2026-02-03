const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { signData } = require('../lib/crypto');

// Configuration
const BASE_DIR = path.resolve(__dirname, '..');
const DEMO_SKILL_DIR = path.join(BASE_DIR, 'demo-skill');

async function generateDemo() {
    console.log("🛠️  Generating Isnad Demo Skill...");

    // 1. Generate Keypair
    const keys = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    // 2. Create Manifest
    const manifest = {
      name: "demo-skill",
      version: "1.0.0",
      description: "A secure demo skill for demonstration purposes",
      author: {
        name: "Kkbot",
        id: "did:web:kkbot991.github.io",
        publicKey: keys.publicKey
      },
      permissions: {
        fs_read: ["./data"],
        network: ["api.moltbook.com"]
      },
      identity: {
          author_id: keys.publicKey // Added for installer compatibility
      }
    };

    // 3. Sign Manifest
    // Ensure we are using the internal crypto lib logic
    manifest.signature = signData(manifest, keys.privateKey);

    // 4. Create Directory Structure
    if (!fs.existsSync(DEMO_SKILL_DIR)) {
        fs.mkdirSync(DEMO_SKILL_DIR, { recursive: true });
    }
    
    const dataDir = path.join(DEMO_SKILL_DIR, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    // 5. Write Files
    fs.writeFileSync(
        path.join(DEMO_SKILL_DIR, 'skill_manifest.json'), 
        JSON.stringify(manifest, null, 2)
    );
    
    fs.writeFileSync(
        path.join(dataDir, 'hello.txt'),
        "Hello from the secure Isnad demo skill!"
    );

    console.log(`✅ Demo skill generated in: ${DEMO_SKILL_DIR}`);
    console.log(`🔑 Public Key: ${keys.publicKey.substring(0, 40)}...`);
}

generateDemo().catch(console.error);

