'use strict';

/**
 * Admin panel routes.
 *
 * Every route in this file is behind `requireAdmin` (mounted below) - the
 * server-side gate. Nothing here relies on the UI hiding a button.
 *
 * Order of the middleware stack matters and is deliberate:
 *   requireAdmin  -> cheapest and most important check first
 *   adminLimiter  -> rate limit the authenticated area
 *   uploadIfMultipart -> parse the multipart body (images) when present
 *   verifyCsrf    -> the body is parsed now, so `_csrf` is available
 *
 * Because multer runs before the CSRF check, an unauthenticated or token-less
 * request can never reach a database write (requireAdmin and verifyCsrf both
 * run before the handler), even though the bytes are buffered first.
 */

const crypto = require('node:crypto');
const express = require('express');
const multer = require('multer');
const qrcode = require('qrcode');

const config = require('../config');
const categoriesService = require('../services/categories');
const itemsService = require('../services/items');
const images = require('../services/images');
const users = require('../services/users');
const { Validator, singleValue, toFlag } = require('../utils/validate');
const { setFlash } = require('../middleware/context');
const { verifyCsrf } = require('../middleware/csrf');
const { adminLimiter } = require('../middleware/rate-limit');
const { requireAdmin } = require('../middleware/auth');
const { discountedPrice } = require('../utils/format');
const { notFound, HttpError } = require('../utils/errors');
const i18n = require('../i18n');
const logger = require('../utils/logger');
const { buildMenuViewModel } = require('./public');

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Wraps an async handler so a rejected promise reaches the error handler. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Parses a route parameter into a positive integer, or 404s. */
function idFromParam(req) {
  const raw = String(req.params.id || '');
  if (!/^\d{1,10}$/.test(raw)) throw notFound();
  return Number.parseInt(raw, 10);
}

/**
 * Where to send the visitor back after an error.
 * Only a path from our own `/admin` area is ever used, so this cannot become an
 * open redirect.
 */
function safeAdminReturn(req) {
  const referer = req.get('referer');
  if (!referer) return '/admin';
  try {
    const url = new URL(referer);
    if (url.pathname.startsWith('/admin')) return url.pathname;
  } catch {
    /* malformed referer - fall through */
  }
  return '/admin';
}

/* -------------------------------------------------------------------------- */
/* Upload handling                                                            */
/* -------------------------------------------------------------------------- */

const uploadSingle = multer({
  // Memory storage: the file never lands on disk before it is validated.
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxBytes,
    files: config.upload.maxFiles,
    fields: 40,
    fieldSize: 16 * 1024,
    parts: 50,
  },
}).single('image');

function uploadIfMultipart(req, res, next) {
  if (!req.is('multipart/form-data')) return next();

  uploadSingle(req, res, (error) => {
    if (!error) return next();

    // Turn multer's technical errors into a friendly, translated message.
    const key = error.code === 'LIMIT_FILE_SIZE' ? 'error.upload_size' : 'error.upload_invalid';
    logger.security('upload_rejected', { code: error.code || 'unknown', ip: req.ip });
    setFlash(req, 'error', i18n.t(key, req.lang));
    return res.redirect(safeAdminReturn(req));
  });
}

/* -------------------------------------------------------------------------- */
/* Middleware stack for everything below                                      */
/* -------------------------------------------------------------------------- */

router.use(requireAdmin);
router.use(adminLimiter());
router.use(uploadIfMultipart);
router.use(verifyCsrf);

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

router.get(
  '/',
  asyncHandler((req, res) => {
    const categories = categoriesService.list();
    const items = itemsService.listForAdmin();

    return res.render('admin/dashboard', {
      pageTitle: res.locals.t('admin.title'),
      adminSection: 'items',
      categories,
      items,
      discountedPrice,
    });
  })
);

/* -------------------------------------------------------------------------- */
/* Items: create                                                              */
/* -------------------------------------------------------------------------- */

const EMPTY_ITEM_VALUES = {
  categoryId: '',
  nameFa: '',
  nameEn: '',
  descriptionFa: '',
  descriptionEn: '',
  price: '',
  discountPercent: '0',
  rating: '',
  altFa: '',
  altEn: '',
  isActive: true,
  imagePath: null,
};

/** Maps a database row onto the shape the form template uses. */
function valuesFromItem(item) {
  return {
    categoryId: String(item.category_id),
    nameFa: item.name_fa,
    nameEn: item.name_en,
    descriptionFa: item.description_fa,
    descriptionEn: item.description_en,
    price: String(item.price),
    discountPercent: String(item.discount_percent),
    rating: item.rating === null ? '' : String(item.rating),
    altFa: item.alt_fa,
    altEn: item.alt_en,
    isActive: item.is_active === 1,
    imagePath: item.image_path,
  };
}

/** Raw, untrusted values straight from the form (used to re-render on error). */
function rawValuesFromBody(req, { fallbackActive }) {
  return {
    categoryId: String(singleValue(req.body.category_id) ?? ''),
    nameFa: String(singleValue(req.body.name_fa) ?? ''),
    nameEn: String(singleValue(req.body.name_en) ?? ''),
    descriptionFa: String(singleValue(req.body.description_fa) ?? ''),
    descriptionEn: String(singleValue(req.body.description_en) ?? ''),
    price: String(singleValue(req.body.price) ?? ''),
    discountPercent: String(singleValue(req.body.discount_percent) ?? '0'),
    rating: String(singleValue(req.body.rating) ?? ''),
    altFa: String(singleValue(req.body.alt_fa) ?? ''),
    altEn: String(singleValue(req.body.alt_en) ?? ''),
    // An unchecked checkbox is not submitted at all.
    isActive: req.body.is_active !== undefined ? req.body.is_active !== '' : fallbackActive,
  };
}

router.get('/items/new', (req, res) => {
  const categories = categoriesService.listSimple();
  return res.render('admin/item-form', {
    pageTitle: res.locals.t('admin.add_item'),
    adminSection: 'items',
    isNew: true,
    itemId: null,
    values: { ...EMPTY_ITEM_VALUES, categoryId: categories[0] ? String(categories[0].id) : '' },
    categories,
    errors: {},
  });
});

router.post(
  '/items',
  asyncHandler(async (req, res) => saveItem(req, res, null))
);

/* -------------------------------------------------------------------------- */
/* Items: edit / update                                                       */
/* -------------------------------------------------------------------------- */

router.get('/items/:id/edit', (req, res) => {
  const item = itemsService.findById(idFromParam(req));
  if (!item) throw notFound();

  return res.render('admin/item-form', {
    pageTitle: res.locals.t('admin.edit_item'),
    adminSection: 'items',
    isNew: false,
    itemId: item.id,
    values: valuesFromItem(item),
    categories: categoriesService.listSimple(),
    errors: {},
  });
});

router.post(
  '/items/:id',
  asyncHandler(async (req, res) => saveItem(req, res, idFromParam(req)))
);

/**
 * Shared create/update logic.
 * Validation happens entirely on the server; the database is only touched when
 * every field passed.
 */
async function saveItem(req, res, itemId) {
  const t = res.locals.t;
  const existing = itemId ? itemsService.findById(itemId) : null;
  if (itemId && !existing) throw notFound();

  const categories = categoriesService.listSimple();
  const validator = new Validator(req.lang);
  const raw = rawValuesFromBody(req, { fallbackActive: existing ? existing.is_active === 1 : true });

  const categoryId = validator.integer(raw.categoryId, {
    field: 'category_id',
    label: t('admin.category'),
    min: 1,
    max: 2_147_483_647,
  });
  if (!validator.hasErrors() && !categories.some((category) => category.id === categoryId)) {
    validator.addError('category_id', t('error.invalid_category'));
  }

  const nameFa = validator.text(raw.nameFa, {
    field: 'name_fa',
    label: t('admin.name_fa'),
    max: 120,
  });
  const nameEn = validator.optionalText(raw.nameEn, {
    field: 'name_en',
    label: t('admin.name_en'),
    max: 120,
  });
  const descriptionFa = validator.optionalText(raw.descriptionFa, {
    field: 'description_fa',
    label: t('admin.description_fa'),
    max: 600,
  });
  const descriptionEn = validator.optionalText(raw.descriptionEn, {
    field: 'description_en',
    label: t('admin.description_en'),
    max: 600,
  });
  // Prices are positive whole Toman amounts - no negatives, no decimals, no text.
  const price = validator.integer(raw.price, {
    field: 'price',
    label: t('admin.price'),
    min: 1,
    max: 1_000_000_000,
  });
  // Discount is an integer between 0 and 100.
  const discountPercent = validator.integer(raw.discountPercent === '' ? '0' : raw.discountPercent, {
    field: 'discount_percent',
    label: t('admin.discount_percent'),
    min: 0,
    max: 100,
  });
  const rating = validator.decimal(raw.rating, {
    field: 'rating',
    label: t('admin.rating'),
    min: 0,
    max: 5,
  });
  const altFa = validator.optionalText(raw.altFa, { field: 'alt_fa', label: t('admin.alt_fa'), max: 200 });
  const altEn = validator.optionalText(raw.altEn, { field: 'alt_en', label: t('admin.alt_en'), max: 200 });

  if (categories.length === 0) {
    validator.addError('category_id', i18n.t('error.invalid_category', req.lang));
  }

  // ---- image -----------------------------------------------------------------
  // Phase 1: check the upload without writing it anywhere. A form that fails
  // validation must never leave a file on disk.
  let preparedImage = null;
  const wantsRemoval = toFlag(singleValue(req.body.remove_image)) === 1;

  if (req.file && req.file.buffer && req.file.buffer.length > 0) {
    try {
      preparedImage = await images.prepareImage(req.file.buffer);
    } catch (error) {
      if (!(error instanceof HttpError)) throw error;
      validator.addError('image', t(error.messageKey));
    }
  }

  if (validator.hasErrors()) {
    // Re-render the form with the owner's input and the messages still in place.
    // Any uploaded bytes are dropped rather than stored.
    return res.status(400).render('admin/item-form', {
      pageTitle: itemId ? t('admin.edit_item') : t('admin.add_item'),
      adminSection: 'items',
      isNew: !itemId,
      itemId,
      values: { ...raw, imagePath: existing ? existing.image_path : null },
      categories,
      errors: validator.errors,
    });
  }

  // Phase 2: everything passed, so the image can be written to disk now.
  const storedImage = preparedImage ? await preparedImage.commit() : null;

  let imagePath = existing ? existing.image_path : null;
  if (wantsRemoval) imagePath = null;
  if (storedImage) imagePath = storedImage.urlPath;

  const payload = {
    categoryId,
    nameFa,
    nameEn,
    descriptionFa,
    descriptionEn,
    price,
    discountPercent,
    rating,
    imagePath,
    altFa,
    altEn,
    isActive: raw.isActive,
  };

  let saved;
  try {
    saved = itemId ? itemsService.update(itemId, payload) : itemsService.create(payload);
  } catch (error) {
    // The row was not written, so do not leave the new file behind.
    if (storedImage) await images.removeStored(storedImage.urlPath);
    throw error;
  }

  // Only now that the database points at the new file is the old one removed.
  if (existing && existing.image_path && existing.image_path !== imagePath) {
    await images.removeStored(existing.image_path);
  }

  setFlash(req, 'success', t('admin.saved'));
  return res.redirect('/admin');
}

/* -------------------------------------------------------------------------- */
/* Items: delete, reorder, activate                                           */
/* -------------------------------------------------------------------------- */

/** Confirmation page (a GET, so it can be a normal link and works without JS). */
router.get('/items/:id/delete', (req, res) => {
  const item = itemsService.findById(idFromParam(req));
  if (!item) throw notFound();

  return res.render('admin/confirm-delete', {
    pageTitle: res.locals.t('admin.delete'),
    adminSection: 'items',
    action: `/admin/items/${item.id}/delete`,
    cancelHref: '/admin',
    question: res.locals.t('admin.confirm_delete_item'),
    target: `${item.name_fa}${item.name_en ? ` — ${item.name_en}` : ''}`,
  });
});

router.post(
  '/items/:id/delete',
  asyncHandler(async (req, res) => {
    const id = idFromParam(req);
    const item = itemsService.findById(id);
    if (!item) throw notFound();

    itemsService.remove(id);
    if (item.image_path) await images.removeStored(item.image_path);

    setFlash(req, 'success', res.locals.t('admin.deleted'));
    return res.redirect('/admin');
  })
);

router.post('/items/:id/move', (req, res) => {
  const id = idFromParam(req);
  if (!itemsService.findById(id)) throw notFound();

  const direction = singleValue(req.body.direction) === 'up' ? 'up' : 'down';
  itemsService.move(id, direction);
  return res.redirect(safeAdminReturn(req));
});

router.post('/items/:id/toggle', (req, res) => {
  const id = idFromParam(req);
  const item = itemsService.findById(id);
  if (!item) throw notFound();

  itemsService.setActive(id, item.is_active !== 1);
  return res.redirect(safeAdminReturn(req));
});

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

router.get('/categories', (req, res) => {
  return res.render('admin/categories', {
    pageTitle: res.locals.t('admin.categories'),
    adminSection: 'categories',
    categories: categoriesService.list(),
    errors: {},
    values: { nameFa: '', nameEn: '' },
  });
});

function reRenderCategories(res, req, { errors, values }) {
  return res.status(400).render('admin/categories', {
    pageTitle: res.locals.t('admin.categories'),
    adminSection: 'categories',
    categories: categoriesService.list(),
    errors,
    values,
  });
}

/** Validates the two name fields shared by create and rename. */
function validateCategoryNames(req, validator) {
  const t = res.locals.t;
  const nameFa = validator.text(singleValue(req.body.name_fa), {
    field: 'name_fa',
    label: t('admin.name_fa'),
    max: 80,
  });
  const nameEn = validator.optionalText(singleValue(req.body.name_en), {
    field: 'name_en',
    label: t('admin.name_en'),
    max: 80,
  });
  return { nameFa, nameEn };
}

router.post('/categories', (req, res) => {
  const validator = new Validator(req.lang);
  const { nameFa, nameEn } = validateCategoryNames(req, validator);

  if (validator.hasErrors()) {
    return reRenderCategories(res, req, {
      errors: validator.errors,
      values: {
        nameFa: String(singleValue(req.body.name_fa) ?? ''),
        nameEn: String(singleValue(req.body.name_en) ?? ''),
      },
    });
  }

  // The English name is optional; fall back to the Persian one so nothing is blank.
  categoriesService.create(nameFa, nameEn || nameFa);
  setFlash(req, 'success', res.locals.t('admin.saved'));
  return res.redirect('/admin/categories');
});

router.post('/categories/:id', (req, res) => {
  const id = idFromParam(req);
  const category = categoriesService.findById(id);
  if (!category) throw notFound();

  const validator = new Validator(req.lang);
  const { nameFa, nameEn } = validateCategoryNames(req, validator);

  if (validator.hasErrors()) {
    return reRenderCategories(res, req, {
      errors: validator.errors,
      values: {
        nameFa: String(singleValue(req.body.name_fa) ?? ''),
        nameEn: String(singleValue(req.body.name_en) ?? ''),
      },
    });
  }

  categoriesService.rename(id, nameFa, nameEn || nameFa);
  setFlash(req, 'success', res.locals.t('admin.saved'));
  return res.redirect('/admin/categories');
});

/** Confirmation page for deleting a category. */
router.get('/categories/:id/delete', (req, res) => {
  const category = categoriesService.findById(idFromParam(req));
  if (!category) throw notFound();

  return res.render('admin/confirm-delete', {
    pageTitle: res.locals.t('admin.delete'),
    adminSection: 'categories',
    action: `/admin/categories/${category.id}/delete`,
    cancelHref: '/admin/categories',
    question: res.locals.t('admin.confirm_delete_category'),
    target: `${category.name_fa}${category.name_en ? ` — ${category.name_en}` : ''}`,
  });
});

router.post('/categories/:id/delete', (req, res) => {
  const id = idFromParam(req);
  const category = categoriesService.findById(id);
  if (!category) throw notFound();

  const result = categoriesService.remove(id);
  if (!result.deleted) {
    // Refuse rather than silently deleting the owner's menu items.
    setFlash(req, 'error', res.locals.t('admin.category_not_empty'));
    return res.redirect('/admin/categories');
  }

  setFlash(req, 'success', res.locals.t('admin.deleted'));
  return res.redirect('/admin/categories');
});

router.post('/categories/:id/move', (req, res) => {
  const id = idFromParam(req);
  if (!categoriesService.findById(id)) throw notFound();

  const direction = singleValue(req.body.direction) === 'up' ? 'up' : 'down';
  categoriesService.move(id, direction);
  return res.redirect('/admin/categories');
});

/* -------------------------------------------------------------------------- */
/* Preview                                                                    */
/* -------------------------------------------------------------------------- */

router.get('/preview', (req, res) => {
  return res.render('menu', {
    pageTitle: res.locals.t('admin.preview'),
    ...buildMenuViewModel({ includeInactive: true }),
    isPreviewPage: true,
    previewBackLink: '/admin',
  });
});

/* -------------------------------------------------------------------------- */
/* QR code                                                                    */
/* -------------------------------------------------------------------------- */

/** The address the QR code should point at. */
function menuUrl(req) {
  if (config.publicBaseUrl) return config.publicBaseUrl;
  return `${req.protocol}://${req.get('host')}`;
}

router.get('/qr', (req, res) => {
  return res.render('admin/qr', {
    pageTitle: res.locals.t('admin.qr'),
    adminSection: 'qr',
    url: menuUrl(req),
    usesEnvUrl: Boolean(config.publicBaseUrl),
  });
});

router.get(
  '/qr.png',
  asyncHandler(async (req, res) => {
    // A PNG (not an SVG): an image format cannot carry script.
    const png = await qrcode.toBuffer(menuUrl(req), {
      type: 'png',
      width: 720,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#121212ff', light: '#ffffffff' },
    });
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-store');
    return res.send(png);
  })
);

/* -------------------------------------------------------------------------- */
/* Password                                                                   */
/* -------------------------------------------------------------------------- */

router.get('/password', (req, res) => {
  return res.render('admin/password', {
    pageTitle: res.locals.t('admin.change_password'),
    adminSection: 'password',
    errors: {},
  });
});

router.post(
  '/password',
  asyncHandler(async (req, res, next) => {
    const t = res.locals.t;
    const validator = new Validator(req.lang);

    const currentPassword = validator.text(singleValue(req.body.current_password), {
      field: 'current_password',
      label: t('admin.current_password'),
      max: 200,
    });
    const newPassword = validator.text(singleValue(req.body.new_password), {
      field: 'new_password',
      label: t('admin.new_password'),
      min: users.MIN_PASSWORD_LENGTH,
      max: 200,
    });
    const confirmation = validator.text(singleValue(req.body.confirm_password), {
      field: 'confirm_password',
      label: t('admin.confirm_password'),
      max: 200,
    });

    if (newPassword && confirmation && newPassword !== confirmation) {
      validator.addError('confirm_password', t('error.password_mismatch'));
    }

    const currentMatches = await users.verifyPassword(currentPassword, req.user.password_hash);
    if (!currentMatches) validator.addError('current_password', t('error.invalid_credentials'));

    if (validator.hasErrors()) {
      return res.status(400).render('admin/password', {
        pageTitle: t('admin.change_password'),
        adminSection: 'password',
        errors: validator.errors,
      });
    }

    await users.changePassword(req.user.id, newPassword);
    logger.security('admin_password_changed', { accountId: req.user.id });

    // Fresh session id after a credential change.
    return req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.userId = req.user.id;
      req.session.csrfToken = crypto.randomBytes(32).toString('base64url');
      return req.session.save((saveError) => {
        if (saveError) return next(saveError);
        setFlash(req, 'success', t('admin.password_changed'));
        return res.redirect('/admin');
      });
    });
  })
);

module.exports = { router };
