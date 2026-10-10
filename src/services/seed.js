'use strict';

/**
 * Demo menu.
 *
 * Loaded automatically when SEED_DEMO=1 and the database is empty (the sandbox
 * preview does this), or on demand with `npm run seed`. It exists so the owner
 * can see a finished-looking menu and the design straight away, and so the
 * preview is not an empty page on first boot.
 *
 * Deleting all of these rows in the admin panel is perfectly safe - nothing in
 * the application depends on them.
 */

const { db, transaction } = require('../db');
const items = require('./items');
const logger = require('../utils/logger');

const DEMO_MENU = [
  {
    nameFa: 'نوشیدنی گرم',
    nameEn: 'Hot drinks',
    items: [
      { fa: 'اسپرسو', en: 'Espresso', dFa: 'قهوه تک شات با کرمای غنی', dEn: 'Single shot with a rich crema', price: 85000, rating: 4.7 },
      { fa: 'کاپوچینو', en: 'Cappuccino', dFa: 'اسپرسو با شیر بخارپز و فوم مخملی', dEn: 'Espresso with steamed milk and velvety foam', price: 125000, rating: 4.5, discount: 15 },
      { fa: 'لاته', en: 'Caffè Latte', dFa: 'شیر بیشتر، طعم ملایم قهوه', dEn: 'Extra milk, a soft coffee taste', price: 135000, rating: 4.4 },
      { fa: 'چای سیاه', en: 'Black tea', dFa: 'چای سیاه دم‌کشیده با نبات', dEn: 'Brewed black tea served with rock candy', price: 65000, rating: 4.2 },
    ],
  },
  {
    nameFa: 'نوشیدنی سرد',
    nameEn: 'Cold drinks',
    items: [
      { fa: 'آیس آمریکانو', en: 'Iced Americano', dFa: 'اسپرسو و آب سرد روی یخ', dEn: 'Espresso and cold water over ice', price: 115000, rating: 4.3 },
      { fa: 'لیموناد نعناع', en: 'Mint lemonade', dFa: 'لیموی تازه، نعناع و یخ خردشده', dEn: 'Fresh lime, mint and crushed ice', price: 105000, rating: 4.8, discount: 20 },
      { fa: 'میلک‌شیک شکلات', en: 'Chocolate milkshake', dFa: 'شکلات تلخ، بستنی و شیر', dEn: 'Dark chocolate, ice cream and milk', price: 145000, rating: 4.6 },
    ],
  },
  {
    nameFa: 'دسر و شیرینی',
    nameEn: 'Desserts',
    items: [
      { fa: 'چیزکیک نیویورکی', en: 'New York cheesecake', dFa: 'با سس تمشک خانگی', dEn: 'Served with homemade raspberry sauce', price: 175000, rating: 4.9, discount: 10 },
      { fa: 'براونی شکلاتی', en: 'Chocolate brownie', dFa: 'براونی گرم با بستنی وانیلی', dEn: 'Warm brownie with vanilla ice cream', price: 165000, rating: 4.7 },
      { fa: 'کروسان کره‌ای', en: 'Butter croissant', dFa: 'تازه پخته‌شده هر روز صبح', dEn: 'Baked fresh every morning', price: 95000, rating: 4.1 },
    ],
  },
  {
    nameFa: 'غذای اصلی',
    nameEn: 'Main dishes',
    items: [
      { fa: 'پاستا آلفردو', en: 'Alfredo pasta', dFa: 'پاستا با سس خامه‌ای قارچ و مرغ', dEn: 'Creamy mushroom and chicken sauce', price: 285000, rating: 4.6 },
      { fa: 'برگر مخصوص', en: 'Signature burger', dFa: 'گوشت گریل، پنیر چدار و سیب‌زمینی', dEn: 'Grilled beef, cheddar and fries', price: 320000, rating: 4.8, discount: 25 },
      { fa: 'سالاد سزار', en: 'Caesar salad', dFa: 'کاهو، نان تست، پارمزان و مرغ گریل', dEn: 'Lettuce, croutons, parmesan and grilled chicken', price: 245000, rating: 4.4 },
    ],
  },
];

/** True when there is nothing to show yet. */
function isMenuEmpty() {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM items').get();
  const { categories } = db.prepare('SELECT COUNT(*) AS categories FROM categories').get();
  return total === 0 && categories === 0;
}

/** Inserts the demo menu. Returns how many items were created. */
function seedDemoMenu() {
  return transaction(() => {
    let created = 0;
    for (const group of DEMO_MENU) {
      const maxOrder = db
        .prepare('SELECT COALESCE(MAX(sort_order), -1) AS max FROM categories')
        .get().max;
      const categoryId = db
        .prepare('INSERT INTO categories (name_fa, name_en, sort_order) VALUES (?, ?, ?)')
        .run(group.nameFa, group.nameEn, maxOrder + 1).lastInsertRowid;

      for (const item of group.items) {
        items.create({
          categoryId,
          nameFa: item.fa,
          nameEn: item.en,
          descriptionFa: item.dFa,
          descriptionEn: item.dEn,
          price: item.price,
          discountPercent: item.discount || 0,
          rating: item.rating ?? null,
          imagePath: null,
          altFa: item.fa,
          altEn: item.en,
          isActive: true,
        });
        created += 1;
      }
    }
    return created;
  })();
}

function seedIfEmpty() {
  if (!isMenuEmpty()) return 0;
  const created = seedDemoMenu();
  logger.info(`Demo menu loaded (${created} items)`);
  return created;
}

module.exports = { seedDemoMenu, seedIfEmpty, isMenuEmpty, DEMO_MENU };
