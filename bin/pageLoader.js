#!/usr/bin/env node

import { Command } from 'commander';
import process from 'process';
import pageLoader from '../index.js';

const program = new Command();

program
  .description('Page loader utility.')
  .version('0.0.1')
  .argument('<url>')
  .option('-o, --output [dir]', 'Output dir', process.cwd())
  .action((url, options) => pageLoader(url, options.output).then(console.log));

program.parse(process.argv);
