#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function promptProjectName(defaultName, callback) {
    rl.question(`Enter the project name (default: ${defaultName}): `, (answer) => {
        callback(answer.trim() || defaultName);
        rl.close();
    });
}

promptProjectName("my-awesome-ts-library", (projectName) => {
    console.log(`🚀 Initializing TypeScript project: ${projectName}...\n`);
    try {
        execSync(`mkdir ${projectName}`, { stdio: "inherit" });
        process.chdir(projectName);
        execSync("npm init -y", { stdio: "inherit" });
        execSync("npm install typescript tslib @types/node --save-dev", { stdio: "inherit" });

        const tsConfig = {
            compilerOptions: {
                target: "ES6",
                module: "CommonJS",
                declaration: true,
                outDir: "./dist",
                strict: true,
            },
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            include: ["src/**/*"],
        };
        fs.writeFileSync("tsconfig.json", JSON.stringify(tsConfig, null, 2));

        execSync("mkdir src", { stdio: "inherit" });
        fs.writeFileSync(
            "src/index.ts",
            `
/**
 * Sample function: Adds two numbers.
 * @param a First number
 * @param b Second number
 * @returns The sum of the two numbers
 */
export function add(a: number, b: number): number {
  return a + b;
}
`.trim()
        );

        const packageJson = JSON.parse(fs.readFileSync("package.json"));
        packageJson.scripts = {
            build: "tsc",
        };
        packageJson.main = "dist/index.js";
        packageJson.types = "dist/index.d.ts";
        packageJson.files = ["dist"];
        fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

        console.log("\n✅ TypeScript project initialized successfully!");
        console.log("👉 Run the following commands to build your project:");
        console.log("   cd", projectName);
        console.log("   npm run build");
    } catch (error) {
        console.error("❌ Error during project initialization:", error.message);
    }
});
