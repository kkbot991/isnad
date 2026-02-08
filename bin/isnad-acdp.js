#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
    console.log(`
Usage: isnad-acdp <command> [options]

Commands:
  init    Initialize a new .well-known/agent.json file

Options:
  -o, --output <dir>    Output directory (default: current dir)
`);
    process.exit(0);
}

if (command === 'init') {
    let outputDir = '.';
    // Simple arg parsing for -o
    const oIndex = args.indexOf('-o') > -1 ? args.indexOf('-o') : args.indexOf('--output');
    if (oIndex > -1 && args[oIndex + 1]) {
        outputDir = args[oIndex + 1];
    }

    const acdp = {
        acdp_version: "0.1",
        identity: {
            name: "MyAgent",
            id: "did:isnad:example",
            owner: "Unknown",
            home_url: "",
            avatar: ""
        },
        capabilities: [],
        verification: {
            provider: "isnad",
            proof_url: "",
            score: 0.0
        }
    };

    const wellKnownDir = path.join(outputDir, '.well-known');
    if (!fs.existsSync(wellKnownDir)) {
        fs.mkdirSync(wellKnownDir, { recursive: true });
    }

    const filePath = path.join(wellKnownDir, 'agent.json');
    if (fs.existsSync(filePath)) {
        console.error(`❌ Error: ${filePath} already exists.`);
        process.exit(1);
    }

    fs.writeFileSync(filePath, JSON.stringify(acdp, null, 2));
    console.log(`✅ ACDP metadata initialized at ${filePath}`);
    console.log(`   Edit this file to publish your agent's identity and skills.`);
} else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
