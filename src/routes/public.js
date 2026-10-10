'use strict';

/**
 * Public menu routes.
 *
 * There is no login here and no write endpoint of any kind: a customer can only
 * read the menu. Inactive items never leave the database on this path, and the
 * page is rendered on the server so it works on a slow connection with no
 * JavaScript at all (the search box is a progressive enhancement).
 */

const express = require('express');
const itemsService = require('../services/items');
const categoriesService = require('../services/categories');
const { discountedPrice } = require('../utils/format');
const { db } = require('../db');

const router = express.Router();

/**
 * Turns a database row into exactly the values the template needs.
 * Doing this here keeps the template free of arithmetic and makes it obvious
 * which fields are public.
 */
function toPublicItem(row, { includeInactive = false } = {}) {
  const hasDiscount = Number(row.discount_percent) > 0;
  return {
    id: row.id,
    categoryId: row.category_id,
    nameFa: row.name_fa,
    nameEn: row.name_en,
    descriptionFa: row.description_fa,
    descriptionEn: row.description_en,
    price: Number(row.price),
    finalPrice: discountedPrice(row.price, row.discount_percent),
    hasDiscount,
    discountPercent: hasDiscount ? Number(row.discount_percent) : 0,
    rating: row.rating === null || row.rating === undefined ? null : Number(row.rating),
    imagePath: row.image_path,
    altFa: row.alt_fa || row.name_fa,
    altEn: row.alt_en || row.name_en || row.name_fa,
    // Only used on the admin preview page.
    isActive: includeInactive ? row.is_active === 1 : true,
  };
}

/** Builds the view model shared by the public menu and the admin preview. */
function buildMenuViewModel({ includeInactive = false } = {}) {
  const rows = includeInactive ? itemsService.listForPreview() : itemsService.listForMenu();
  const categories = includeInactive
    ? categoriesService.listSimple()
    : categoriesService.listForMenu();

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const publicItems = rows
    .filter((row) => categoriesById.has(row.category_id))
    .map((row) => ({ ...toPublicItem(row, { includeInactive }), categoryId: row.category_id }));

  const groups = categories
    .map((category) => ({
      category,
      items: publicItems.filter((item) => item.categoryId === category.id),
    }))
    .filter((group) => group.items.length > 0);

  return { groups, categories, totalItems: publicItems.length };
}

/** Renders the public menu. Shared by `/` and `/en`. */
function renderMenu(req, res) {
  const model = buildMenuViewModel();
  return res.render('menu', {
    ...model,
    isPreviewPage: false,
    pageTitle: res.locals.t('app.name'),
  });
}

router.get('/', renderMenu);
// The language switch is a plain link; this route keeps `/en` bookmarkable.
router.get('/en', (req, res) => {
  res.cookie('dm_lang', 'en', { httpOnly: true, sameSite: 'lax', path: '/' });
  return res.redirect('/?lang=en');
});

/**
 * Health probe used by the container healthcheck.
 * Intentionally tiny: it proves the process answers AND the database is readable.
 * It exposes nothing about the application's internals.
 */
router.get('/healthz', (req, res) => {
  try {
    db.prepare('SELECT 1 AS ok').get();
    res.set('Cache-Control', 'no-store');
    return res.json({ status: 'ok' });
  } catch {
    return res.status(503).json({ status: 'unavailable' });
  }
});

module.exports = { router, buildMenuViewModel, toPublicItem };
