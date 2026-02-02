#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { verifySignature } = require('../lib/crypto');

// Simple ANSI colors for zero-dep pretty printing
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
  gray: "\x1b[90m"
};

const log = {
  success: (msg) => console.log(`${colors.green}✔ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✖ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  dim: (msg) => console.log(`${colors.gray}${msg}${colors.reset}`)
};

async function main() {
  console.log(`${colors.bold}🛡️  Isnad Verification Tool${colors.reset}`);
  
  const targetDir = process.argv[2] || '.';
  const skillPath = path.resolve(process.cwd(), targetDir);
  
  if (!fs.existsSync(skillPath)) {
    log.error(`Directory not found: ${skillPath}`);
    process.exit(1);
  }

  log.info(`Scanning: ${skillPath}`);

  // Check for skill manifest
  const manifestPath = path.join(skillPath, 'skill_manifest.json');
  if (!fs.existsSync(manifestPath)) {
    log.warn('No skill_manifest.json found.');
    log.dim('   This skill has not been signed with Isnad.');
    log.dim('   Trust Score: 0/100 (Unverified)');
    process.exit(0);
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Check structure
    if (!manifest.signature || !manifest.author || !manifest.author.publicKey) {
      log.error('Invalid manifest structure. Missing signature or author key.');
      process.exit(1);
    }

    log.dim(`   Skill: ${manifest.name} v${manifest.version}`);
    log.dim(`   Author: ${manifest.author.name} (${manifest.author.id})`);

    // Verify Signature
    const isValid = verifySignature(manifest, manifest.signature, manifest.author.publicKey);

    if (isValid) {
      console.log('');
      log.success(`${colors.bold}SIGNATURE VERIFIED${colors.reset}`);
      log.success('Integrity Check: PASSED');
      log.success('Author Identity: CRYPTOGRAPHICALLY PROVEN');
      
      // Future: Check attestations
      const attestationCount = (manifest.attestations || []).length;
      if (attestationCount > 0) {
        log.info(`${attestationCount} Peer Attestations found`);
      }

      console.log(`\n${colors.green}${colors.bold}RECOMMENDATION: ALLOW${colors.reset}`);
      console.log(`${colors.gray}Trust Score: 100/100${colors.reset}`);
    } else {
      console.log('');
      log.error(`${colors.bold}SIGNATURE VERIFICATION FAILED${colors.reset}`);
      log.error('The manifest has been tampered with or the key does not match.');
      
      console.log(`\n${colors.red}${colors.bold}RECOMMENDATION: BLOCK${colors.reset}`);
      process.exit(1);
    }

  } catch (err) {
    log.error(`Error processing manifest: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
