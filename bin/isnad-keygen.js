#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generateKeypair } = require('../lib/keygen');

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
  console.log(`${colors.bold}🔑 Isnad Key Generation Tool${colors.reset}`);
  
  const privateKeyPath = process.argv[2] || 'isnad.key';
  const publicKeyPath = privateKeyPath.endsWith('.key') 
    ? privateKeyPath.replace('.key', '.pub') 
    : privateKeyPath + '.pub';

  if (fs.existsSync(privateKeyPath)) {
    log.error(`Key file already exists: ${privateKeyPath}`);
    log.info('Specify a different name or remove the existing file.');
    process.exit(1);
  }

  try {
    const { publicKey, privateKey } = generateKeypair();

    fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
    fs.writeFileSync(publicKeyPath, publicKey);

    log.success('KEYPAIR GENERATED SUCCESSFULLY');
    log.info(`Private key saved to: ${privateKeyPath}`);
    log.info(`Public key saved to: ${publicKeyPath}`);
    
    console.log(`\n${colors.bold}Your Public Key:${colors.reset}`);
    console.log(publicKey.trim());
    
    log.dim('\nKeep your private key secure. It is required for signing manifests.');

  } catch (err) {
    log.error(`Key generation failed: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
