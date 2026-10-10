#!/usr/bin/env node
'use strict';

/**
 * Builds the release archive: `dist/digital-menu.zip`.
 *
 * Why this is hand-written: the container image has Node but no `zip` binary,
 * and adding a packaging dependency to a security-sensitive project is not worth
 * it. Node's own `zlib` provides deflate and the CRC-32, so a small, readable
 * ZIP writer is enough.
 *
 * Excluded: node_modules, .git, data (database + uploads), dist and any .env
 * file - the archive never ships secrets or user data.
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'dist');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'digital-menu.zip');

const EXCLUDED_NAMES = new Set([
  'node_modules',
  '.git',
  'data',
  'dist',
  '.env',
  '.env.local',
  '.DS_Store',
]);

function isExcluded(relativePath) {
  const parts = relativePath.split(path.sep);
  if (parts.some((part) => EXCLUDED_NAMES.has(part))) return true;
  if (relativePath.endsWith('.zip')) return true;
  if (relativePath.endsWith('.log')) return true;
  return false;
}

/** Every file that belongs in the archive, as paths relative to the repo root. */
function collectFiles(dir = ROOT, prefix = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relative = prefix ? path.join(prefix, entry.name) : entry.name;
    if (isExcluded(relative)) continue;

    if (entry.isDirectory()) {
      files.push(...collectFiles(path.join(dir, entry.name), relative));
    } else if (entry.isFile()) {
      files.push(relative);
    }
  }

  return files;
}

/** Converts a Date to the DOS date/time pair used by the ZIP format. */
function toDosDateTime(date) {
  const time =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = (date.getFullYear() - 1980) << 9;
  const month = (date.getMonth() + 1) << 5;
  return { time, date: day | month | date.getDate() };
}

/** Builds one local file header + data block for `name`. */
function buildEntry(name, content, stat) {
  const dos = toDosDateTime(stat.mtime);
  const compressed = zlib.deflateRawSync(content, { level: 9 });
  const nameBuffer = Buffer.from(name.split(path.sep).join('/'), 'utf8');
  const crc = zlib.crc32(content);

  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0); // local file header signature
  header.writeUInt16LE(20, 4); // version needed to extract
  header.writeUInt16LE(0x0800, 6); // general purpose flag: UTF-8 names
  header.writeUInt16LE(8, 8); // compression method: deflate
  header.writeUInt16LE(dos.time, 10);
  header.writeUInt16LE(dos.date, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(compressed.length, 18);
  header.writeUInt32LE(content.length, 22);
  header.writeUInt16LE(nameBuffer.length, 26);
  header.writeUInt16LE(0, 28); // extra field length

  return { header, nameBuffer, compressed, crc, dos, size: content.length };
}

/** Central directory record for an entry produced by buildEntry. */
function buildCentralRecord(entry, offset) {
  const record = Buffer.alloc(46);
  record.writeUInt32LE(0x02014b50, 0); // central directory signature
  record.writeUInt16LE(20, 4); // version made by
  record.writeUInt16LE(20, 6); // version needed
  record.writeUInt16LE(0x0800, 8);
  record.writeUInt16LE(8, 10);
  record.writeUInt16LE(entry.dos.time, 12);
  record.writeUInt16LE(entry.dos.date, 14);
  record.writeUInt32LE(entry.crc, 16);
  record.writeUInt32LE(entry.compressed.length, 20);
  record.writeUInt32LE(entry.size, 24);
  record.writeUInt16LE(entry.nameBuffer.length, 28);
  record.writeUInt16LE(0, 30); // extra length
  record.writeUInt16LE(0, 32); // comment length
  record.writeUInt16LE(0, 34); // disk number start
  record.writeUInt16LE(0, 36); // internal attributes
  record.writeUInt32LE(0, 38); // external attributes
  record.writeUInt32LE(offset, 42); // offset of the local header
  return Buffer.concat([record, entry.nameBuffer]);
}

function main() {
  const files = collectFiles().sort();
  if (files.length === 0) throw new Error('Nothing to package.');

  const chunks = [];
  const centralRecords = [];
  let offset = 0;

  for (const relative of files) {
    const absolute = path.join(ROOT, relative);
    const content = fs.readFileSync(absolute);
    const stat = fs.statSync(absolute);

    const entry = buildEntry(relative, content, stat);
    const local = Buffer.concat([entry.header, entry.nameBuffer, entry.compressed]);

    chunks.push(local);
    centralRecords.push(buildCentralRecord(entry, offset));
    offset += local.length;
  }

  const centralDirectory = Buffer.concat(centralRecords);

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // end of central directory signature
  end.writeUInt16LE(0, 4); // disk number
  end.writeUInt16LE(0, 6); // disk with central directory
  end.writeUInt16LE(centralRecords.length, 8);
  end.writeUInt16LE(centralRecords.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20); // comment length

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, Buffer.concat([...chunks, centralDirectory, end]));

  const sizeMb = (fs.statSync(OUTPUT_FILE).size / (1024 * 1024)).toFixed(2);
  console.log(`Packaged ${files.length} files into ${path.relative(ROOT, OUTPUT_FILE)} (${sizeMb} MB)`);
}

try {
  main();
} catch (error) {
  console.error(`Packaging failed: ${error.message}`);
  process.exitCode = 1;
}
