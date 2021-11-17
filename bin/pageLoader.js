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
  .action((url, options) => pageLoader(url, options.output)
    .then((filepath) => console.log(`Page was loaded to ${filepath}`))
    .catch((err) => {
      console.error(`${err.message} with url ${url}`);
      process.exit(1);
    }));

program.parse(process.argv);
