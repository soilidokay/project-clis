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

promptProjectName("my-react-ts-library", (projectName) => {
  console.log(`🚀 Initializing React TypeScript Component Library: ${projectName}...\n`);
  try {
    execSync(`mkdir ${projectName}`, { stdio: "inherit" });
    process.chdir(projectName);
    execSync("npm init -y", { stdio: "inherit" });

    execSync(
      "npm install react react-dom tslib && npm install typescript @types/react @types/react-dom rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-typescript rollup-plugin-peer-deps-external rollup-plugin-postcss --save-dev",
      { stdio: "inherit" }
    );

    const tsConfig = {
      "compilerOptions": {
        "target": "ES6",
        "module": "ESNext",
        "jsx": "react",
        "declaration": true,
        "declarationDir": "./dist/types",
        "outDir": "./dist",
        "strict": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
      },
      "include": [
        "src/**/*"
      ],
      "exclude": [
        "node_modules",
        "dist"
      ],
    };
    fs.writeFileSync("tsconfig.json", JSON.stringify(tsConfig, null, 2));

    const rollupConfig = `import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
const packageJson = require('./package.json');

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: packageJson.main, // Main CommonJS output
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: packageJson.module, // Module ESM output
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json', // Use tsconfig.json to manage settings
      declaration: true,
      declarationDir: 'dist', // Output type declarations
      rootDir: 'src',
    }),
    postcss({
      extract: true, // Output CSS file
      minimize: true, // Minify CSS
    }),
    terser(), // Minify JS
  ],
};
    
`;
    fs.writeFileSync("rollup.config.js", rollupConfig.trim());

    execSync("mkdir src", { stdio: "inherit" });
    fs.writeFileSync(
      "src/Button.tsx",
      `
import React from 'react';

export interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};
`.trim()
    );
    fs.writeFileSync("src/index.tsx", `export * from './Button';`);

    const packageJson = {
      "name": "core-mfe-module",
      "version": "1.0.3",
      "description": "",
      "main": "dist/index.js",
      "module": "dist/index.esm.js",
      "scripts": {
        "build": "npx rimraf dist && rollup -c --bundleConfigAsCjs"
      },
      "keywords": [
        "core-mfe"
      ],
      "author": "",
      "license": "ISC",
      "dependencies": {
        "tslib": "^2.8.1"
      },
      "devDependencies": {
        "@rollup/plugin-commonjs": "^28.0.1",
        "@rollup/plugin-node-resolve": "^15.3.0",
        "@rollup/plugin-typescript": "^12.1.1",
        "@types/react": "^18.3.1",
        "@types/react-dom": "^18.3.1",
        "postcss": "^8.4.49",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "rimraf": "^6.0.1",
        "rollup": "^4.28.0",
        "rollup-plugin-peer-deps-external": "^2.2.4",
        "rollup-plugin-postcss": "^4.0.2",
        "rollup-plugin-terser": "^7.0.2",
        "typescript": "^5.7.2"
      },
      "peerDependenciesMeta": {
        "react": {
          "optional": true
        },
        "react-dom": {
          "optional": true
        }
      },
      "types": "dist/index.d.ts",
      "files": [
        "dist"
      ]
    };
    packageJson.scripts = {
      build: "rollup -c",
    };
    packageJson.peerDependencies = {
      react: "^18.0.0",
      "react-dom": "^18.0.0",
    };
    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

    console.log("\n✅ React TypeScript Component Library initialized successfully!");
    console.log("👉 Run the following commands to build your project:");
    console.log("   cd", projectName);
    console.log("   npm run build");
  } catch (error) {
    console.error("❌ Error during project initialization:", error.message);
  }
});
