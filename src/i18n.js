'use strict';

/**
 * Tiny translation layer.
 *
 * The public menu defaults to Persian (RTL); English is a secondary language
 * that can be switched from the header. Only interface strings live here -
 * item names/descriptions are stored twice in the database (Persian + English).
 *
 * `t('menu.search_placeholder')` returns the Persian string unless a language
 * is passed: `t('menu.search_placeholder', 'en')`.
 */

const DICTIONARY = {
  fa: {
    'app.name': 'منوی دیجیتال',
    'app.tagline': 'منوی کافه و رستوران',

    'lang.switch': 'English',
    'lang.current': 'فارسی',

    'menu.search_placeholder': 'جستجوی غذا...',
    'menu.search_label': 'جستجوی آیتم‌های منو',
    'menu.all_categories': 'همه',
    'menu.categories_label': 'دسته‌بندی‌ها',
    'menu.no_results': 'آیتمی با این مشخصات پیدا نشد.',
    'menu.empty': 'هنوز آیتمی به منو اضافه نشده است.',
    'menu.results_count': 'آیتم نمایش داده شده',
    'menu.currency': 'تومان',
    'menu.discount': 'تخفیف',
    'menu.original_price': 'قیمت اصلی',
    'menu.rating': 'امتیاز',
    'menu.minutes': 'دقیقه',
    'menu.details': 'جزئیات',
    'menu.close': 'بستن',
    'menu.show_to_cashier': 'این صفحه را به صندوقدار نشان دهید.',
    'menu.menu_link': 'منو',
    'menu.clear_search': 'پاک کردن جستجو',

    'admin.title': 'پنل مدیریت منو',
    'admin.login': 'ورود مدیر',
    'admin.email': 'ایمیل',
    'admin.password': 'رمز عبور',
    'admin.login_submit': 'ورود',
    'admin.logout': 'خروج',
    'admin.dashboard': 'آیتم‌های منو',
    'admin.categories': 'دسته‌بندی‌ها',
    'admin.preview': 'پیش‌نمایش منو',
    'admin.qr': 'کد QR',
    'admin.change_password': 'تغییر رمز عبور',
    'admin.back_to_menu': 'مشاهده منو',
    'admin.signed_in_as': 'وارد شده به عنوان',
    'admin.current_password': 'رمز عبور فعلی',
    'admin.new_password': 'رمز عبور جدید',
    'admin.confirm_password': 'تکرار رمز عبور جدید',
    'admin.save': 'ذخیره',
    'admin.cancel': 'انصراف',
    'admin.add_item': 'افزودن آیتم جدید',
    'admin.edit_item': 'ویرایش آیتم',
    'admin.back': 'بازگشت',
    'admin.delete': 'حذف',
    'admin.edit': 'ویرایش',
    'admin.name_fa': 'نام (فارسی)',
    'admin.name_en': 'نام (انگلیسی)',
    'admin.description_fa': 'توضیح (فارسی)',
    'admin.description_en': 'توضیح (انگلیسی)',
    'admin.category': 'دسته‌بندی',
    'admin.price': 'قیمت (تومان)',
    'admin.discount_percent': 'درصد تخفیف',
    'admin.rating': 'امتیاز (۰ تا ۵)',
    'admin.image': 'تصویر',
    'admin.image_help': 'فرمت JPG، PNG یا WebP - حداکثر ۵ مگابایت',
    'admin.current_image': 'تصویر فعلی',
    'admin.remove_image': 'حذف تصویر',
    'admin.alt_fa': 'متن جایگزین تصویر (فارسی)',
    'admin.alt_en': 'متن جایگزین تصویر (انگلیسی)',
    'admin.active': 'فعال',
    'admin.inactive': 'غیرفعال',
    'admin.status': 'وضعیت',
    'admin.display_order': 'ترتیب نمایش',
    'admin.move_up': 'بالا',
    'admin.move_down': 'پایین',
    'admin.no_items': 'هیچ آیتمی ثبت نشده است.',
    'admin.confirm_delete_item': 'این آیتم برای همیشه حذف شود؟',
    'admin.add_category': 'افزودن دسته‌بندی',
    'admin.rename_category': 'تغییر نام',
    'admin.confirm_delete_category': 'این دسته‌بندی حذف شود؟',
    'admin.no_categories': 'هیچ دسته‌بندی‌ای ثبت نشده است.',
    'admin.items_in_category': 'آیتم',
    'admin.category_not_empty': 'این دسته‌بندی آیتم دارد؛ ابتدا آیتم‌هایش را جابه‌جا یا حذف کنید.',
    'admin.category_created': 'دسته‌بندی ساخته شد.',
    'admin.preview_notice': 'این یک پیش‌نمایش است؛ آیتم‌های غیرفعال هم نمایش داده می‌شوند.',
    'admin.qr_help': 'این کد را چاپ کنید و روی میزها قرار دهید. مشتری با اسکن آن، منو را می‌بیند.',
    'admin.qr_url': 'لینک منو',
    'admin.qr_download': 'دانلود تصویر کد QR',
    'admin.qr_missing_base': 'برای ساخت کد QR آدرس عمومی منو را در تنظیمات (PUBLIC_BASE_URL) وارد کنید.',
    'admin.toggle_activate': 'فعال کردن',
    'admin.toggle_deactivate': 'غیرفعال کردن',
    'admin.saved': 'تغییرات با موفقیت ذخیره شد.',
    'admin.deleted': 'آیتم با موفقیت حذف شد.',
    'admin.logged_in': 'خوش آمدید!',
    'admin.logged_out': 'با موفقیت خارج شدید.',
    'admin.password_changed': 'رمز عبور تغییر کرد.',

    'error.title': 'خطایی رخ داد',
    'error.generic': 'متأسفانه مشکلی پیش آمد. لطفاً دوباره تلاش کنید.',
    'error.not_found': 'صفحه مورد نظر پیدا نشد.',
    'error.forbidden': 'شما به این بخش دسترسی ندارید.',
    'error.bad_request': 'اطلاعات ارسالی نامعتبر است.',
    'error.invalid_credentials': 'ایمیل یا رمز عبور نادرست است.',
    'error.account_locked': 'به دلیل تلاش‌های ناموفق، حساب موقتاً قفل شده است. کمی بعد دوباره تلاش کنید.',
    'error.too_many_requests': 'تعداد درخواست‌ها زیاد است. لطفاً کمی صبر کنید.',
    'error.upload_type': 'فقط فایل‌های JPG، PNG و WebP مجاز هستند.',
    'error.upload_size': 'حجم تصویر باید کمتر از ۵ مگابایت باشد.',
    'error.upload_invalid': 'فایل ارسالی یک تصویر معتبر نیست.',
    'error.csrf': 'نشست شما منقضی شده است. صفحه را دوباره بارگذاری کنید.',
    'error.invalid_category': 'ابتدا یک دسته‌بندی بسازید و آن را انتخاب کنید.',
    'error.password_mismatch': 'رمز عبور جدید و تکرار آن یکسان نیستند.',
  },

  en: {
    'app.name': 'Digital Menu',
    'app.tagline': 'Cafe and restaurant menu',

    'lang.switch': 'فارسی',
    'lang.current': 'English',

    'menu.search_placeholder': 'Search dishes...',
    'menu.search_label': 'Search menu items',
    'menu.all_categories': 'All',
    'menu.categories_label': 'Categories',
    'menu.no_results': 'No items match your search.',
    'menu.empty': 'No items have been added to the menu yet.',
    'menu.results_count': 'items shown',
    'menu.currency': 'Toman',
    'menu.discount': 'OFF',
    'menu.original_price': 'Original price',
    'menu.rating': 'Rating',
    'menu.minutes': 'min',
    'menu.details': 'Details',
    'menu.close': 'Close',
    'menu.show_to_cashier': 'Show this screen to the cashier.',
    'menu.menu_link': 'Menu',
    'menu.clear_search': 'Clear search',

    'admin.title': 'Menu admin panel',
    'admin.login': 'Admin sign in',
    'admin.email': 'Email',
    'admin.password': 'Password',
    'admin.login_submit': 'Sign in',
    'admin.logout': 'Sign out',
    'admin.dashboard': 'Menu items',
    'admin.categories': 'Categories',
    'admin.preview': 'Preview menu',
    'admin.qr': 'QR code',
    'admin.change_password': 'Change password',
    'admin.back_to_menu': 'View menu',
    'admin.signed_in_as': 'Signed in as',
    'admin.current_password': 'Current password',
    'admin.new_password': 'New password',
    'admin.confirm_password': 'Repeat new password',
    'admin.save': 'Save',
    'admin.cancel': 'Cancel',
    'admin.add_item': 'Add new item',
    'admin.edit_item': 'Edit item',
    'admin.back': 'Back',
    'admin.delete': 'Delete',
    'admin.edit': 'Edit',
    'admin.name_fa': 'Name (Persian)',
    'admin.name_en': 'Name (English)',
    'admin.description_fa': 'Description (Persian)',
    'admin.description_en': 'Description (English)',
    'admin.category': 'Category',
    'admin.price': 'Price (Toman)',
    'admin.discount_percent': 'Discount percent',
    'admin.rating': 'Rating (0 to 5)',
    'admin.image': 'Image',
    'admin.image_help': 'JPG, PNG or WebP - maximum 5 MB',
    'admin.current_image': 'Current image',
    'admin.remove_image': 'Remove image',
    'admin.alt_fa': 'Image alt text (Persian)',
    'admin.alt_en': 'Image alt text (English)',
    'admin.active': 'Active',
    'admin.inactive': 'Inactive',
    'admin.status': 'Status',
    'admin.display_order': 'Display order',
    'admin.move_up': 'Up',
    'admin.move_down': 'Down',
    'admin.no_items': 'No items yet.',
    'admin.confirm_delete_item': 'Delete this item permanently?',
    'admin.add_category': 'Add category',
    'admin.rename_category': 'Rename',
    'admin.confirm_delete_category': 'Delete this category?',
    'admin.no_categories': 'No categories yet.',
    'admin.items_in_category': 'items',
    'admin.category_not_empty': 'This category still has items; move or delete them first.',
    'admin.category_created': 'Category created.',
    'admin.preview_notice': 'This is a preview; inactive items are shown as well.',
    'admin.qr_help': 'Print this code and put it on your tables. Scanning it opens the menu.',
    'admin.qr_url': 'Menu link',
    'admin.qr_download': 'Download QR image',
    'admin.qr_missing_base': 'Set the public menu URL (PUBLIC_BASE_URL) to generate the QR code.',
    'admin.toggle_activate': 'Activate',
    'admin.toggle_deactivate': 'Deactivate',
    'admin.saved': 'Changes saved successfully.',
    'admin.deleted': 'Item deleted successfully.',
    'admin.logged_in': 'Welcome back!',
    'admin.logged_out': 'You are signed out.',
    'admin.password_changed': 'Password changed.',

    'error.title': 'Something went wrong',
    'error.generic': 'Sorry, something went wrong. Please try again.',
    'error.not_found': 'Page not found.',
    'error.forbidden': 'You do not have access to this area.',
    'error.bad_request': 'The submitted data is not valid.',
    'error.invalid_credentials': 'Email or password is incorrect.',
    'error.account_locked': 'Too many failed attempts. The account is temporarily locked.',
    'error.too_many_requests': 'Too many requests. Please wait a moment.',
    'error.upload_type': 'Only JPG, PNG and WebP files are allowed.',
    'error.upload_size': 'The image must be smaller than 5 MB.',
    'error.upload_invalid': 'The uploaded file is not a valid image.',
    'error.csrf': 'Your session expired. Please reload the page.',
    'error.invalid_category': 'Create a category first, then select it.',
    'error.password_mismatch': 'The new password and its confirmation do not match.',
  },
};

/** Languages the app knows about. Persian is the default. */
const LANGUAGES = ['fa', 'en'];
const DEFAULT_LANGUAGE = 'fa';

/** Text direction per language, used for <html dir="...">. */
const DIRECTIONS = { fa: 'rtl', en: 'ltr' };

/**
 * Translate a key.
 * @param {string} key
 * @param {string} [lang] `fa` (default) or `en`
 */
function t(key, lang = DEFAULT_LANGUAGE) {
  const chosen = LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
  const value = DICTIONARY[chosen][key];
  if (value === undefined) {
    // Fall back to the default language, then to the key itself.
    return DICTIONARY[DEFAULT_LANGUAGE][key] ?? key;
  }
  return value;
}

/** The same string in both languages, handy for validation messages. */
function both(key) {
  return { fa: t(key, 'fa'), en: t(key, 'en') };
}

function dir(lang) {
  return DIRECTIONS[LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE];
}

module.exports = { t, both, dir, LANGUAGES, DEFAULT_LANGUAGE };
