const crypto = require('crypto');
const { signData, verifySignature } = require('../lib/crypto');
const IsnadInstaller = require('../lib/install_skill');

/**
 * Unit tests for Isnad Trust Chain
 */

function generateIdentity() {
  return crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
}

async function runTests() {
  console.log("🚀 Running Isnad Unit Tests...\n");

  const alice = generateIdentity();
  const rufio = generateIdentity(); // Auditor
  const mallory = generateIdentity();

  const manifest = {
    version: "1.0.0",
    meta: { name: "test-skill" },
    identity: { author_id: alice.publicKey },
    permissions: { network: ["api.example.com"] }
  };

  // --- Test 1: Valid Signature ---
  console.log("Test 1: Valid signature verification...");
  manifest.signature = signData(manifest, alice.privateKey);
  const isSigValid = verifySignature(manifest, manifest.signature, alice.publicKey);
  console.log(isSigValid ? "✅ Pass" : "❌ Fail");

  // --- Test 2: Tamper Detection ---
  console.log("Test 2: Tamper detection...");
  const tamperedManifest = JSON.parse(JSON.stringify(manifest));
  tamperedManifest.permissions.network.push("evil.com");
  const isTamperedValid = verifySignature(tamperedManifest, manifest.signature, alice.publicKey);
  console.log(!isTamperedValid ? "✅ Pass (Tampering detected)" : "❌ Fail (Tampering NOT detected)");

  // --- Test 3: Installer Logic ---
  console.log("Test 3: Installer basic verification...");
  const installer = new IsnadInstaller({
    trustedAuthors: [alice.publicKey]
  });

  const result = await installer.verifySkill({ manifest });
  console.log(result.validSignature && result.authorTrusted ? "✅ Pass" : "❌ Fail");

  // --- Test 4: Attestation Logic ---
  console.log("Test 4: Attestation and Policy check...");
  const attestation = {
    target_id: "test-skill",
    verdict: "safe",
    auditor_id: rufio.publicKey
  };
  attestation.signature = signData(attestation, rufio.privateKey);

  const policyInstaller = new IsnadInstaller({
    trustedAuthors: [alice.publicKey],
    trustedAuditors: [rufio.publicKey],
    policy: {
      requireAttestation: true,
      minAttestations: 1
    }
  });

  const attResult = await policyInstaller.verifySkill({ 
    manifest, 
    attestations: [attestation] 
  });
  
  console.log(attResult.policyPassed ? "✅ Pass (Policy enforced)" : "❌ Fail");

  // --- Test 5: Untrusted Auditor ---
  console.log("Test 5: Untrusted auditor rejection...");
  const badAttestation = {
    target_id: "test-skill",
    verdict: "safe",
    auditor_id: mallory.publicKey
  };
  badAttestation.signature = signData(badAttestation, mallory.privateKey);

  const failResult = await policyInstaller.verifySkill({
    manifest,
    attestations: [badAttestation]
  });
  console.log(!failResult.policyPassed ? "✅ Pass (Untrusted auditor rejected)" : "❌ Fail");

  console.log("\n🏁 All tests completed.");
}

runTests().catch(console.error);
