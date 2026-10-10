'use strict';

/**
 * Menu items: read, create, update, delete, reorder, activate/deactivate.
 *
 * The public menu only ever reads rows with `is_active = 1` (see
 * `listForMenu`), which is how "inactive items are hidden from the public menu"
 * is enforced - in the query, on the server, not in the template.
 */

const { db, transaction } = require('../db');

const PUBLIC_COLUMNS = `
  i.id, i.category_id, i.name_fa, i.name_en, i.description_fa, i.description_en,
  i.price, i.discount_percent, i.rating, i.image_path, i.alt_fa, i.alt_en,
  i.is_active, i.sort_order, i.created_at, i.updated_at,
  c.name_fa AS category_name_fa, c.name_en AS category_name_en,
  c.sort_order AS category_sort_order
`;

const statements = {
  allForAdmin: db.prepare(`
    SELECT ${PUBLIC_COLUMNS}
    FROM items i JOIN categories c ON c.id = i.category_id
    ORDER BY c.sort_order ASC, c.id ASC, i.sort_order ASC, i.id ASC
  `),
  activeForMenu: db.prepare(`
    SELECT ${PUBLIC_COLUMNS}
    FROM items i JOIN categories c ON c.id = i.category_id
    WHERE i.is_active = 1
    ORDER BY c.sort_order ASC, c.id ASC, i.sort_order ASC, i.id ASC
  `),
  allIncludingInactiveForPreview: db.prepare(`
    SELECT ${PUBLIC_COLUMNS}
    FROM items i JOIN categories c ON c.id = i.category_id
    ORDER BY c.sort_order ASC, c.id ASC, i.sort_order ASC, i.id ASC
  `),
  byId: db.prepare('SELECT * FROM items WHERE id = ?'),
  insert: db.prepare(`
    INSERT INTO items (
      category_id, name_fa, name_en, description_fa, description_en,
      price, discount_percent, rating, image_path, alt_fa, alt_en, is_active, sort_order
    ) VALUES (
      @category_id, @name_fa, @name_en, @description_fa, @description_en,
      @price, @discount_percent, @rating, @image_path, @alt_fa, @alt_en, @is_active, @sort_order
    )
  `),
  update: db.prepare(`
    UPDATE items SET
      category_id = @category_id,
      name_fa = @name_fa,
      name_en = @name_en,
      description_fa = @description_fa,
      description_en = @description_en,
      price = @price,
      discount_percent = @discount_percent,
      rating = @rating,
      image_path = @image_path,
      alt_fa = @alt_fa,
      alt_en = @alt_en,
      is_active = @is_active,
      updated_at = datetime('now')
    WHERE id = @id
  `),
  remove: db.prepare('DELETE FROM items WHERE id = ?'),
  setActive: db.prepare("UPDATE items SET is_active = ?, updated_at = datetime('now') WHERE id = ?"),
  setImage: db.prepare("UPDATE items SET image_path = ?, updated_at = datetime('now') WHERE id = ?"),
  maxOrder: db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS max FROM items WHERE category_id = ?'),
  updateOrder: db.prepare('UPDATE items SET sort_order = ? WHERE id = ?'),
  previousInCategory: db.prepare(`
    SELECT id, sort_order FROM items
    WHERE category_id = ? AND (sort_order < ? OR (sort_order = ? AND id < ?))
    ORDER BY sort_order DESC, id DESC LIMIT 1
  `),
  nextInCategory: db.prepare(`
    SELECT id, sort_order FROM items
    WHERE category_id = ? AND (sort_order > ? OR (sort_order = ? AND id > ?))
    ORDER BY sort_order ASC, id ASC LIMIT 1
  `),
};

const listForAdmin = () => statements.allForAdmin.all();
const listForMenu = () => statements.activeForMenu.all();
const listForPreview = () => statements.allIncludingInactiveForPreview.all();
const findById = (id) => statements.byId.get(Number(id)) || null;

/** Next free display position inside a category. */
function nextSortOrder(categoryId) {
  return statements.maxOrder.get(Number(categoryId)).max + 1;
}

/**
 * @param {object} data already validated by utils/validate.js
 * @returns {object} the created row
 */
function create(data) {
  const payload = {
    category_id: Number(data.categoryId),
    name_fa: data.nameFa,
    name_en: data.nameEn,
    description_fa: data.descriptionFa,
    description_en: data.descriptionEn,
    price: Number(data.price),
    discount_percent: Number(data.discountPercent) || 0,
    rating: data.rating === null || data.rating === undefined ? null : Number(data.rating),
    image_path: data.imagePath || null,
    alt_fa: data.altFa || '',
    alt_en: data.altEn || '',
    is_active: data.isActive ? 1 : 0,
    sort_order: nextSortOrder(data.categoryId),
  };
  const result = statements.insert.run(payload);
  return findById(result.lastInsertRowid);
}

function update(id, data) {
  const existing = findById(id);
  if (!existing) return null;

  // Moving an item to the end of another category keeps the ordering sensible.
  const movedCategory = Number(data.categoryId) !== existing.category_id;
  const payload = {
    id: Number(id),
    category_id: Number(data.categoryId),
    name_fa: data.nameFa,
    name_en: data.nameEn,
    description_fa: data.descriptionFa,
    description_en: data.descriptionEn,
    price: Number(data.price),
    discount_percent: Number(data.discountPercent) || 0,
    rating: data.rating === null || data.rating === undefined ? null : Number(data.rating),
    image_path: data.imagePath === undefined ? existing.image_path : data.imagePath,
    alt_fa: data.altFa || '',
    alt_en: data.altEn || '',
    is_active: data.isActive ? 1 : 0,
  };
  statements.update.run(payload);

  if (movedCategory) {
    statements.updateOrder.run(nextSortOrder(payload.category_id), payload.id);
  }
  return findById(id);
}

function remove(id) {
  const result = statements.remove.run(Number(id));
  return result.changes > 0;
}

function setActive(id, isActive) {
  statements.setActive.run(isActive ? 1 : 0, Number(id));
  return findById(id);
}

function setImage(id, imagePath) {
  statements.setImage.run(imagePath, Number(id));
  return findById(id);
}

/** Moves an item one position up or down inside its own category. */
function move(id, direction) {
  const stepUp = direction === 'up';
  return transaction(() => {
    const current = statements.byId.get(Number(id));
    if (!current) return false;

    const lookup = stepUp ? statements.previousInCategory : statements.nextInCategory;
    const neighbour = lookup.get(
      current.category_id,
      current.sort_order,
      current.sort_order,
      current.id
    );
    if (!neighbour) return false;

    statements.updateOrder.run(neighbour.sort_order, current.id);
    statements.updateOrder.run(current.sort_order, neighbour.id);
    return true;
  })();
}

/** Groups items by category, ready for the menu template. */
function groupByCategory(items, categories) {
  return categories
    .map((category) => ({
      category,
      items: items.filter((item) => item.category_id === category.id),
    }))
    .filter((group) => group.items.length > 0);
}

module.exports = {
  listForAdmin,
  listForMenu,
  listForPreview,
  findById,
  create,
  update,
  remove,
  setActive,
  setImage,
  move,
  groupByCategory,
};
