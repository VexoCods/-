/* ==========================================================================
   Public menu behaviour - progressive enhancement only.

   The menu is fully rendered on the server, so this file adds search and
   category filtering on top of an already working page. All text written to the
   DOM goes through `textContent`, which is what keeps the client side free of
   XSS: data from the database is never parsed as HTML here.
   ========================================================================== */
(function () {
  'use strict';

  var searchInput = document.getElementById('menu-search');
  var clearButton = document.getElementById('menu-search-clear');
  var chipContainer = document.getElementById('menu-chips');
  var status = document.getElementById('menu-status');
  var dialog = document.getElementById('item-dialog');

  if (!searchInput || !chipContainer) return;

  var chips = Array.prototype.slice.call(chipContainer.querySelectorAll('.chip'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-item]'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-category-section]'));

  var activeCategory = 'all';
  var query = '';

  /**
   * Normalises a search string so Persian/Arabic variants match each other:
   * Arabic yeh/kaf -> Persian, digits -> ASCII, diacritics removed.
   */
  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[\u064A\u0649]/g, '\u06CC') // ي ى -> ی
      .replace(/\u0643/g, '\u06A9') // ك -> ک
      .replace(/[\u0623\u0625\u0622\u0627]/g, '\u0627') // alef variants -> ا
      .replace(/[\u064B-\u0652\u0640]/g, '') // diacritics and tatweel
      .replace(/[\u06F0-\u06F9]/g, function (d) {
        return String(d.charCodeAt(0) - 0x06f0);
      })
      .replace(/[\u0660-\u0669]/g, function (d) {
        return String(d.charCodeAt(0) - 0x0660);
      })
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Shows only the cards that match both the search text and the category. */
  function applyFilters() {
    var visibleCount = 0;

    cards.forEach(function (card) {
      var matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
      var matchesQuery = query === '' || normalize(card.dataset.search).indexOf(query) !== -1;
      var show = matchesCategory && matchesQuery;
      card.hidden = !show;
      if (show) visibleCount += 1;
    });

    sections.forEach(function (section) {
      var hasVisibleCard = section.querySelector('[data-item]:not([hidden])') !== null;
      section.hidden = !hasVisibleCard;
    });

    // Only warn about "nothing found" when there was something to find.
    if (status) status.hidden = visibleCount !== 0 || cards.length === 0;
    if (clearButton) clearButton.hidden = query === '';
  }

  function onSearch() {
    query = normalize(searchInput.value);
    applyFilters();
  }

  searchInput.addEventListener('input', onSearch);
  searchInput.addEventListener('search', onSearch);

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      query = '';
      applyFilters();
      searchInput.focus();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeCategory = chip.dataset.category;

      chips.forEach(function (other) {
        other.classList.toggle('chip--active', other === chip);
      });

      applyFilters();

      // Bring the first visible section into view for a smooth transition.
      var firstVisibleSection = sections.filter(function (section) {
        return !section.hidden;
      })[0];

      if (firstVisibleSection && typeof firstVisibleSection.scrollIntoView === 'function') {
        firstVisibleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ------------------------------------------------------------------------
     Item detail dialog
     ------------------------------------------------------------------------ */
  if (dialog && typeof dialog.showModal === 'function') {
    var image = dialog.querySelector('#item-dialog-image');
    var title = dialog.querySelector('#item-dialog-title');
    var titleEn = dialog.querySelector('#item-dialog-title-en');
    var meta = dialog.querySelector('#item-dialog-meta');
    var description = dialog.querySelector('#item-dialog-desc');
    var price = dialog.querySelector('#item-dialog-price');

    var LANG = document.documentElement.getAttribute('lang') || 'fa';
    var CURRENCY = dialog.dataset.currency || '';
    var SHOW_TO_CASHIER = dialog.dataset.hint || '';

    /** Formats an integer with thousands separators. */
    function formatPrice(value) {
      var number = Number(value);
      if (!isFinite(number)) return '';
      return Math.round(number).toLocaleString('en-US');
    }

    /** Fills the dialog from the card's data attributes (never as HTML). */
    function fillDialog(card) {
      var hasDiscount = Number(card.dataset.discount) > 0;
      var nameFa = card.dataset.nameFa || '';
      var nameEn = card.dataset.nameEn || '';
      var primaryName = LANG === 'fa' ? nameFa || nameEn : nameEn || nameFa;
      var secondaryName = LANG === 'fa' ? nameEn : nameFa;
      var primaryDesc =
        LANG === 'fa'
          ? card.dataset.descFa || card.dataset.descEn
          : card.dataset.descEn || card.dataset.descFa;

      if (image) {
        if (card.dataset.image) {
          image.src = card.dataset.image;
          image.alt = LANG === 'fa' ? card.dataset.altFa || '' : card.dataset.altEn || '';
          image.hidden = false;
        } else {
          image.removeAttribute('src');
          image.alt = '';
          image.hidden = true;
        }
      }

      if (title) title.textContent = primaryName;
      if (titleEn) titleEn.textContent = secondaryName === primaryName ? '' : secondaryName;
      if (description) description.textContent = primaryDesc || '';

      if (meta) {
        // Clear previous tags, then rebuild with text nodes only.
        while (meta.firstChild) meta.removeChild(meta.firstChild);

        if (card.dataset.rating) {
          var ratingTag = document.createElement('span');
          ratingTag.className = 'tag';
          ratingTag.textContent = '★ ' + Number(card.dataset.rating).toFixed(1);
          meta.appendChild(ratingTag);
        }

        if (hasDiscount) {
          var discountTag = document.createElement('span');
          discountTag.className = 'tag tag--accent';
          discountTag.textContent = '-' + card.dataset.discount + '%';
          meta.appendChild(discountTag);
        }

        if (SHOW_TO_CASHIER) {
          var hintTag = document.createElement('span');
          hintTag.className = 'tag tag--muted';
          hintTag.textContent = SHOW_TO_CASHIER;
          meta.appendChild(hintTag);
        }
      }

      if (price) {
        while (price.firstChild) price.removeChild(price.firstChild);

        if (hasDiscount) {
          var oldPrice = document.createElement('del');
          oldPrice.className = 'item-dialog__price-old';
          oldPrice.textContent = formatPrice(card.dataset.price);
          price.appendChild(oldPrice);
        }

        price.appendChild(
          document.createTextNode(
            formatPrice(hasDiscount ? card.dataset.finalPrice : card.dataset.price) + ' ' + CURRENCY
          )
        );
      }
    }

    document.querySelectorAll('[data-open-item]').forEach(function (button) {
      button.addEventListener('click', function () {
        var card = button.closest('[data-item]');
        if (!card) return;
        fillDialog(card);
        dialog.showModal();
      });
    });

    var closeButton = dialog.querySelector('[data-close-item]');
    if (closeButton) {
      closeButton.addEventListener('click', function () {
        dialog.close();
      });
    }

    // Clicking the backdrop (the dialog element itself) closes it.
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
  }
})();
