#!/usr/bin/env node

import path from 'path';
import { Plop, run } from 'plop';
import chalk from 'chalk';
import minimist from 'minimist';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const argv = minimist(args);

console.log(chalk.blue('🚀 Controller Generator CLI'));
console.log(chalk.gray('Generating C# Controller structure...'));

Plop.prepare(
  {
    cwd: argv.cwd,
    configPath: path.join(__dirname, 'plopfile.js'),
    completion: argv.completion,
  },
  function (env) {
    const plop = Plop.execute(env, (env) => run(env, undefined, true));
  }
);