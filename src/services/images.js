'use strict';

/**
 * Image upload pipeline.
 *
 * The rules from the brief, and how each one is enforced:
 *
 *   JPG / PNG / WebP only ....... the file is identified by its magic bytes
 *                                (content), never by the file extension or the
 *                                browser-supplied MIME type.
 *   Max 5 MB ................... enforced twice: multer stops reading at the
 *                                limit, and the buffer length is re-checked here.
 *   Resize + compress .......... sharp resizes the longest edge to 1200px and
 *                                writes WebP quality 82.
 *   Strip EXIF ................. sharp only copies metadata when explicitly
 *                                asked to (`withMetadata()`), so nothing is
 *                                carried over; `rotate()` bakes the EXIF
 *                                orientation into the pixels first.
 *   Random file names .......... a UUID plus a fixed `.webp` suffix. The
 *                                original name is never used, so double
 *                                extensions and path traversal are impossible.
 *   Never trust the pixels ..... re-encoding through sharp also neutralises
 *                                polyglot files (a valid image with a second
 *                                payload appended) and SVG script payloads,
 *                                because SVG is not an accepted format at all.
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const config = require('../config');
const { HttpError } = require('../utils/errors');
const logger = require('../utils/logger');

/** Guard against decompression bombs (a 20 KB PNG can expand to gigabytes). */
const MAX_SOURCE_PIXELS = 40_000_000;

const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp']);

/** Only ever delete files that look exactly like the ones we create. */
const STORED_NAME_PATTERN = /^\/uploads\/[0-9a-f-]{36}\.webp$/;

/**
 * Identifies the file by its leading bytes.
 * @param {Buffer} buffer
 * @returns {'jpeg'|'png'|'webp'|null}
 */
function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.subarray(0, 8).equals(pngSignature)) return 'png';

  // WebP: "RIFF" .... "WEBP"
  if (
    buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buffer.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

/**
 * Validates an uploaded image WITHOUT writing anything to disk.
 *
 * This two-phase design matters: an upload that fails form validation must not
 * leave an orphaned file behind, and a request must not be able to fill the disk
 * with images that were never attached to a menu item.
 *
 * @param {Buffer} buffer raw upload (memory storage, never touches the disk first)
 * @returns {Promise<{width: number, height: number, commit: () => Promise<object>}>}
 * @throws {HttpError} 400 with a translated i18n key when the file is rejected
 */
async function prepareImage(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new HttpError(400, 'error.upload_invalid');
  }
  if (buffer.length > config.upload.maxBytes) {
    throw new HttpError(400, 'error.upload_size');
  }

  // 1. Content sniffing - this is the real type check.
  const detected = detectImageType(buffer);
  if (!detected) {
    throw new HttpError(400, 'error.upload_type');
  }

  // 2. Decode with sharp, refusing absurdly large canvases.
  let buildPipeline;
  let metadata;
  try {
    const image = sharp(buffer, { limitInputPixels: MAX_SOURCE_PIXELS, failOn: 'error' });
    metadata = await image.metadata();

    if (!ACCEPTED_FORMATS.has(metadata.format)) {
      throw new HttpError(400, 'error.upload_type');
    }
    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width < config.upload.minDimension ||
      metadata.height < config.upload.minDimension
    ) {
      throw new HttpError(400, 'error.upload_invalid');
    }

    buildPipeline = () =>
      sharp(buffer, { limitInputPixels: MAX_SOURCE_PIXELS, failOn: 'error' })
        // Apply the EXIF orientation to the pixels, then drop EXIF entirely
        // (sharp only copies metadata when `withMetadata()` is called).
        .rotate()
        .resize({
          width: config.upload.maxDimension,
          height: config.upload.maxDimension,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: config.upload.webpQuality });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.security('image_decode_failed', { reason: error.message });
    throw new HttpError(400, 'error.upload_invalid');
  }

  return {
    width: metadata.width,
    height: metadata.height,
    /** Writes the processed file and returns its public path. */
    async commit() {
      const fileName = `${crypto.randomUUID()}.webp`;
      const filePath = path.join(config.uploadDir, fileName);
      const info = await buildPipeline().toFile(filePath);

      return {
        urlPath: `/uploads/${fileName}`,
        width: info.width,
        height: info.height,
        bytes: info.size,
      };
    },
  };
}

/**
 * Convenience wrapper: validate and store in one call.
 * Used by the CLI scripts and tests where there is no form to validate.
 */
async function processAndStore(buffer) {
  const prepared = await prepareImage(buffer);
  return prepared.commit();
}

/**
 * Deletes a stored image. Silently ignores anything that is not one of our own
 * generated paths, which removes any path-traversal risk from this code path.
 */
async function removeStored(urlPath) {
  if (!urlPath || !STORED_NAME_PATTERN.test(String(urlPath))) return false;

  const fileName = path.basename(String(urlPath));
  const resolved = path.resolve(config.uploadDir, fileName);

  // Belt and braces: the resolved path must stay inside the uploads directory.
  if (!resolved.startsWith(path.resolve(config.uploadDir) + path.sep)) return false;

  try {
    await fs.unlink(resolved);
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warn('Could not delete image file', { file: fileName });
    }
    return false;
  }
}

module.exports = {
  detectImageType,
  prepareImage,
  processAndStore,
  removeStored,
  STORED_NAME_PATTERN,
  MAX_SOURCE_PIXELS,
};
