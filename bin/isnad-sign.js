#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { signData } = require('../lib/crypto');

// Simple ANSI colors
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
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  dim: (msg) => console.log(`${colors.gray}${msg}${colors.reset}`)
};

async function main() {
  console.log(`${colors.bold}🖋️  Isnad Signing Tool${colors.reset}`);
  
  const manifestPathArg = process.argv[2];
  const privateKeyPath = process.env.ISNAD_PRIVATE_KEY_PATH || 'isnad.key';

  if (!manifestPathArg) {
    log.error('Usage: isnad sign <manifest.json>');
    process.exit(1);
  }

  const manifestPath = path.resolve(process.cwd(), manifestPathArg);
  
  if (!fs.existsSync(manifestPath)) {
    log.error(`Manifest file not found: ${manifestPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(privateKeyPath)) {
    log.error(`Private key not found at: ${privateKeyPath}`);
    log.info('Please set ISNAD_PRIVATE_KEY_PATH or ensure isnad.key exists in the current directory.');
    process.exit(1);
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

    log.info(`Signing: ${manifest.name || 'unnamed-skill'}`);
    
    // Perform signing
    const signature = signData(manifest, privateKey);
    
    // Attach signature
    manifest.signature = signature;

    // Write back
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    log.success('MANIFEST SIGNED SUCCESSFULLY');
    log.dim(`   Signature: ${signature.substring(0, 16)}...`);
    log.dim(`   Updated: ${manifestPathArg}`);

  } catch (err) {
    log.error(`Signing failed: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
