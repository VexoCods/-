#!/usr/bin/env node
'use strict';

/**
 * Creates (or resets the password of) an admin account.
 *
 * Usage:
 *   npm run create-admin -- --email owner@example.com
 *   npm run create-admin -- --email owner@example.com --password "..."   # CI only
 *
 * Without `--password` the password is read from the terminal without echo and
 * with confirmation, so it never appears in your shell history or in a process
 * listing.
 */

const readline = require('node:readline');
const users = require('../src/services/users');
const { close } = require('../src/db');

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--email') args.email = argv[++index];
    else if (token === '--password') args.password = argv[++index];
    else if (token === '--help' || token === '-h') args.help = true;
  }
  return args;
}

/** Reads a line without echoing it (used for passwords). */
function promptHidden(question) {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    const output = process.stdout;
    if (!input.isTTY) {
      return reject(new Error('Not a terminal: pass --password instead.'));
    }

    const rl = readline.createInterface({ input, output, terminal: true });
    const onData = (char) => {
      const text = String(char);
      if (text === '\n' || text === '\r' || text === '\u0004') return;
      // Repaint the prompt without the typed characters.
      readline.clearLine(output, 0);
      readline.cursorTo(output, 0);
      output.write(question);
    };

    output.write(question);
    input.on('data', onData);
    rl.question('', (answer) => {
      input.removeListener('data', onData);
      rl.close();
      output.write('\n');
      resolve(answer);
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log('Usage: npm run create-admin -- --email owner@example.com [--password "..."]');
    return;
  }

  const email = args.email || process.env.ADMIN_EMAIL;
  if (!email) {
    console.error('An email address is required: --email owner@example.com');
    process.exitCode = 1;
    return;
  }

  let password = args.password || process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await promptHidden('New admin password: ');
    const confirmation = await promptHidden('Repeat the password: ');
    if (password !== confirmation) {
      console.error('The passwords do not match.');
      process.exitCode = 1;
      return;
    }
  }

  if (password.length < users.MIN_PASSWORD_LENGTH) {
    console.error(`The password must be at least ${users.MIN_PASSWORD_LENGTH} characters long.`);
    process.exitCode = 1;
    return;
  }

  const existing = users.findByEmail(email);
  await users.upsertAdmin(email, password);

  console.log(
    existing
      ? `Password updated for the existing admin account ${email}.`
      : `Admin account created for ${email}.`
  );
  console.log('Sign in at /admin/login');
}

main()
  .catch((error) => {
    console.error(`Could not create the admin account: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => close());
