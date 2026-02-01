const crypto = require('crypto');
const { signData, verifySignature, normalize } = require('../lib/crypto');
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

  // --- Test 6: Attestation Replay Attack (Vulnerability Repro) ---
  console.log("Test 6: Attestation Replay Attack...");
  
  // 1. Create a SAFE manifest (v1.0)
  const safeManifest = { ...manifest, version: "1.0.0" };
  safeManifest.signature = signData(safeManifest, alice.privateKey);
  const safeManifestHash = crypto.createHash('sha256').update(normalize(safeManifest)).digest('hex'); // Use normalize for consistency
  
  // 2. Rufio signs an attestation for the SAFE manifest
  // Note: IsnadInstaller expects att.target.manifest_hash to be checked
  const replayAttestation = {
    target: { manifest_hash: safeManifestHash }, 
    verdict: "safe",
    auditor_id: rufio.publicKey
  };
  replayAttestation.signature = signData(replayAttestation, rufio.privateKey);

  // 3. Create a MALICIOUS manifest (v2.0)
  const maliciousManifest = { ...manifest, version: "2.0.0", behavior: "evil" };
  maliciousManifest.signature = signData(maliciousManifest, alice.privateKey); // Alice signed v2 (maybe compromised or just updated)

  // 4. Try to install MALICIOUS manifest with SAFE attestation
  const replayResult = await policyInstaller.verifySkill({
    manifest: maliciousManifest,
    attestations: [replayAttestation]
  });

  // If the policy passes, the vulnerability exists (Replay Successful)
  if (replayResult.policyPassed) {
    console.log("❌ FAIL: Vulnerability Confirmed! Malicious manifest accepted with old attestation.");
  } else {
    console.log("✅ Pass: Replay detected and blocked.");
  }

  console.log("\n🏁 All tests completed.");
}

runTests().catch(console.error);
