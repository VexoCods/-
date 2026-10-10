'use strict';

/**
 * Categories: list, create, rename, delete, reorder.
 *
 * All statements are parameterised. Ordering is stored as a plain integer
 * (`sort_order`) and "move up/down" swaps two rows inside a transaction, which
 * is easy to reason about and works on a phone (no drag and drop needed).
 */

const { db, transaction } = require('../db');

const statements = {
  listWithCounts: db.prepare(`
    SELECT c.id, c.name_fa, c.name_en, c.sort_order,
           COUNT(i.id) AS item_count,
           SUM(CASE WHEN i.is_active = 1 THEN 1 ELSE 0 END) AS active_count
    FROM categories c
    LEFT JOIN items i ON i.category_id = c.id
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.id ASC
  `),
  list: db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, id ASC'),
  // Only categories that actually have something to show appear in the menu nav.
  listForMenu: db.prepare(`
    SELECT c.id, c.name_fa, c.name_en, c.sort_order
    FROM categories c
    WHERE EXISTS (SELECT 1 FROM items i WHERE i.category_id = c.id AND i.is_active = 1)
    ORDER BY c.sort_order ASC, c.id ASC
  `),
  byId: db.prepare('SELECT * FROM categories WHERE id = ?'),
  itemCount: db.prepare('SELECT COUNT(*) AS total FROM items WHERE category_id = ?'),
  insert: db.prepare('INSERT INTO categories (name_fa, name_en, sort_order) VALUES (?, ?, ?)'),
  update: db.prepare('UPDATE categories SET name_fa = ?, name_en = ? WHERE id = ?'),
  remove: db.prepare('DELETE FROM categories WHERE id = ?'),
  maxOrder: db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS max FROM categories'),
  updateOrder: db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?'),
  previous: db.prepare(`
    SELECT id, sort_order FROM categories
    WHERE sort_order < ? OR (sort_order = ? AND id < ?)
    ORDER BY sort_order DESC, id DESC LIMIT 1
  `),
  next: db.prepare(`
    SELECT id, sort_order FROM categories
    WHERE sort_order > ? OR (sort_order = ? AND id > ?)
    ORDER BY sort_order ASC, id ASC LIMIT 1
  `),
};

const list = () => statements.listWithCounts.all();
const listSimple = () => statements.list.all();
const listForMenu = () => statements.listForMenu.all();
const findById = (id) => statements.byId.get(Number(id)) || null;
const itemCount = (id) => statements.itemCount.get(Number(id)).total;

function create(nameFa, nameEn) {
  const { max } = statements.maxOrder.get();
  const result = statements.insert.run(nameFa, nameEn, max + 1);
  return findById(result.lastInsertRowid);
}

function rename(id, nameFa, nameEn) {
  statements.update.run(nameFa, nameEn, Number(id));
  return findById(id);
}

/**
 * Deletes a category. Refuses while it still contains items, so the owner never
 * loses menu items by accident (the UI explains what to do first).
 */
function remove(id) {
  const count = itemCount(id);
  if (count > 0) return { deleted: false, itemCount: count };
  const result = statements.remove.run(Number(id));
  return { deleted: result.changes > 0, itemCount: 0 };
}

/** Moves a category one position up or down by swapping with its neighbour. */
function move(id, direction) {
  const stepUp = direction === 'up';
  return transaction(() => {
    const current = statements.byId.get(Number(id));
    if (!current) return false;

    const lookup = stepUp ? statements.previous : statements.next;
    const neighbour = lookup.get(current.sort_order, current.sort_order, current.id);
    if (!neighbour) return false; // Already first/last.

    statements.updateOrder.run(neighbour.sort_order, current.id);
    statements.updateOrder.run(current.sort_order, neighbour.id);
    return true;
  })();
}

module.exports = { list, listSimple, listForMenu, findById, itemCount, create, rename, remove, move };
