const { execSync } = require('child_process');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDemo() {
    const commands = [
        { text: "# Welcome to Project Isnad Demo", type: "comment" },
        { text: "# Step 1: Clone the repository", type: "comment" },
        { text: "git clone https://github.com/kkbot991/isnad.git", cmd: "echo 'Cloning into isnad...'" },
        { text: "cd isnad", cmd: "echo 'cd isnad'" },
        { text: "", type: "newline" },
        { text: "# Step 2: Run the Trust Chain Verification tests", type: "comment" },
        { text: "node test/trust_chain.test.js", cmd: "node test/trust_chain.test.js" },
        { text: "", type: "newline" },
        { text: "# Step 3: Run the Skill Jail (Containment) tests", type: "comment" },
        { text: "node test/jail.test.js", cmd: "node test/jail.test.js" },
        { text: "", type: "newline" },
        { text: "# Step 4: Verify a signed skill", type: "comment" },
        { text: "node bin/isnad.js verify demo-skill", cmd: "node bin/isnad.js verify demo-skill" },
        { text: "", type: "newline" },
        { text: "# Isnad: The Internet of Verified Logic.", type: "comment" }
    ];

    console.log("\x1b[2J\x1b[0;0H"); // Clear screen

    for (const item of commands) {
        if (item.type === "comment") {
            console.log("\x1b[32m" + item.text + "\x1b[0m");
            await sleep(1000);
        } else if (item.type === "newline") {
            console.log("");
        } else {
            process.stdout.write("\x1b[33m$\x1b[0m ");
            for (let char of item.text) {
                process.stdout.write(char);
                await sleep(50);
            }
            console.log("");
            await sleep(500);
            
            try {
                const output = execSync(item.cmd).toString();
                console.log(output);
            } catch (e) {
                console.log(e.stdout.toString());
            }
            await sleep(1500);
        }
    }
}

runDemo();
