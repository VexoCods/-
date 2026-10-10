#!/usr/bin/env node
'use strict';

/**
 * Generates a QR code image for the public menu.
 *
 * Usage:
 *   npm run qr -- --url https://menu.example.com --out menu-qr.png
 *   npm run qr -- --url https://menu.example.com --out menu-qr.svg
 *
 * If `--url` is omitted, PUBLIC_BASE_URL from the environment is used.
 * The PNG is the safer format to hand to a print shop; SVG is offered for
 * large-format printing.
 */

const fs = require('node:fs');
const path = require('node:path');
const qrcode = require('qrcode');

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--url') args.url = argv[++index];
    else if (token === '--out') args.out = argv[++index];
    else if (token === '--help' || token === '-h') args.help = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log('Usage: npm run qr -- --url https://menu.example.com [--out menu-qr.png]');
    return;
  }

  const url = args.url || process.env.PUBLIC_BASE_URL;
  if (!url) {
    console.error('A menu URL is required: --url https://menu.example.com');
    process.exitCode = 1;
    return;
  }

  const output = path.resolve(args.out || 'menu-qr.png');
  const isSvg = output.toLowerCase().endsWith('.svg');

  if (isSvg) {
    const svg = await qrcode.toString(url, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#121212', light: '#ffffff' },
    });
    fs.writeFileSync(output, svg);
  } else {
    await qrcode.toFile(output, url, {
      type: 'png',
      width: 1024,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#121212ff', light: '#ffffffff' },
    });
  }

  console.log(`QR code for ${url} written to ${output}`);
}

main().catch((error) => {
  console.error(`Could not generate the QR code: ${error.message}`);
  process.exitCode = 1;
});
