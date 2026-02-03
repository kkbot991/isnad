#!/usr/bin/env node

/**
 * isnad.js - Zero-Friction Entry Point
 * Routing logic for the isnad CLI.
 */

const fs = require('fs');
const path = require('path');

const command = process.argv[2];
const args = process.argv.slice(3);

const commands = {
  verify: './isnad-verify.js',
  v: './isnad-verify.js',
  sign: './isnad-sign.js',
  s: './isnad-sign.js',
  keygen: './isnad-keygen.js',
  k: './isnad-keygen.js'
};

async function run() {
  if (!command || command === '--help' || command === '-h' || command === 'help') {
    console.log(`
🛡️  Isnad CLI - Decentralized Trust Protocol

Usage:
  isnad <command> [options]

Commands:
  verify <path>    Verify the signature of a skill manifest
  sign <path>      Sign a skill manifest (requires private key)
  keygen [name]    Generate a new Ed25519 keypair (default: isnad.key)
  help             Show this help message

Aliases:
  v -> verify
  s -> sign
  k -> keygen
    `);
    process.exit(0);
  }

  const scriptPath = commands[command];
  
  if (scriptPath) {
    // Forward to the specific script
    // Correctly handle process.argv for the required script
    process.argv = [process.argv[0], path.resolve(__dirname, scriptPath), ...args];
    require(path.resolve(__dirname, scriptPath));
  } else {
    // If command is a path, default to verify
    if (fs.existsSync(path.resolve(process.cwd(), command))) {
        process.argv = [process.argv[0], process.argv[1], command, ...args];
        require(path.resolve(__dirname, './isnad-verify.js'));
    } else {
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  }
}

run();
