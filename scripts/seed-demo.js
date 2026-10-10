#!/usr/bin/env node
'use strict';

/**
 * Loads the demo menu.
 *
 * Usage:
 *   npm run seed           # only when the menu is currently empty
 *   npm run seed -- --force  # add the demo menu even if items already exist
 *
 * The server does this automatically on first boot when SEED_DEMO=1.
 */

const seed = require('../src/services/seed');
const { close } = require('../src/db');

const force = process.argv.includes('--force');

try {
  if (force) {
    const created = seed.seedDemoMenu();
    console.log(`Demo menu added (${created} items).`);
  } else if (seed.isMenuEmpty()) {
    const created = seed.seedDemoMenu();
    console.log(`Demo menu added (${created} items).`);
  } else {
    console.log('The menu already has content, so nothing was added. Use --force to add it anyway.');
  }
} catch (error) {
  console.error(`Seeding failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  close();
}
