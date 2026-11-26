/*
 * Global reading preferences ("Aa") for Zainabia.Online.
 *
 * Lets a reader independently show/hide and resize four kinds of
 * text on the page they're reading — English (general page prose),
 * Arabic, Transliteration, and Meaning (the translation tied to a
 * quoted Arabic phrase). The control lives once in the shared header
 * (the "Aa" button next to the hamburger menu) and applies via CSS
 * custom properties + element selectors that any current or future
 * article page can opt into just by using the matching classes — no
 * changes to this file are needed when a new article is added.
 *
 * Settings are deliberately temporary: they live only in memory for
 * this page view and reset to defaults on reload or navigation —
 * nothing is written to localStorage or any other storage.
 */
(function () {
  var toggleBtn = document.getElementById("aa-toggle");
  var panel = document.getElementById("aa-panel");
  if (!toggleBtn || !panel) return;

  var CATEGORY_ORDER = ["general", "ar", "translit", "meaning"];
  var LABELS = {
    general: "English",
    ar: "Arabic",
    translit: "Transliteration",
    meaning: "Meaning"
  };

  // Any element on any page (current or future) that carries one of
  // these classes, or matches one of these structural selectors, is
  // treated as belonging to that reading-preference category.
  var SELECTORS = {
    general:
      '.aiq-article > h2, .aiq-article > h3, .aiq-article > p, .aiq-article li, table.aiq-table th, .aiq-count, .aiq-general, ' +
      '.nj-article h2, .nj-article h3, .nj-article h4, .nj-article > p, .nj-article li, .nj-omit-item, .nj-label, .nj-level, table.nj-table th, table.nj-table td:not(.nj-translit-cell), .nj-general, ' +
      '.ah-page h1, .ah-page h2, .ah-page h3:not(.ah-en), .ah-page p:not(.ah-ur):not(.ah-meaning), .ah-badge, .ah-search, .ah-count, .ah-more, .ah-fc-hint, .ah-fc-btn, .ah-fc-status, ' +
      '[data-art="general"]',
    ar: '.aiq-ar, .aiq-ar-cell, .nj-ar, .ah-ar, .ah-fc-ar, [data-art="ar"]',
    translit:
      '.aiq-translit, .aiq-glance-phrase, .nj-translit, table.nj-table .nj-translit-cell, .ah-en, .ah-ur, [data-art="translit"]',
    meaning:
      'table.aiq-table tbody td:nth-child(3), .aiq-urdu, .aiq-glance-item p, .aiq-meaning, .nj-meaning, .ah-meaning, [data-art="meaning"]'
  };

  function defaultState() {
    var show = {};
    var scale = {};
    CATEGORY_ORDER.forEach(function (key) {
      show[key] = true;
      scale[key] = 1;
    });
    return { show: show, scale: scale };
  }

  // In-memory only — no localStorage read on load, so every page
  // view starts from the defaults below.
  var state = defaultState();

  function clampScale(n) {
    return Math.max(0.7, Math.min(1.8, Math.round(n * 100) / 100));
  }

  function apply() {
    CATEGORY_ORDER.forEach(function (key) {
      document.documentElement.style.setProperty("--site-scale-" + key, state.scale[key]);
      var els = document.querySelectorAll(SELECTORS[key]);
      els.forEach(function (el) {
        el.style.display = state.show[key] ? "" : "none";
      });
    });
  }

  // Build the panel UI once.
  CATEGORY_ORDER.forEach(function (key) {
    var row = document.createElement("div");
    row.className = "aa-row";

    var label = document.createElement("label");
    label.className = "aa-check";
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.show[key];
    checkbox.setAttribute("data-cat", key);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + LABELS[key]));

    var sizeWrap = document.createElement("div");
    sizeWrap.className = "aa-size";

    var minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.textContent = "A−";
    minusBtn.setAttribute("data-cat", key);
    minusBtn.setAttribute("data-step", "-1");
    minusBtn.setAttribute("aria-label", "Decrease " + LABELS[key] + " text size");

    var pct = document.createElement("span");
    pct.className = "aa-pct";
    pct.setAttribute("data-cat", key);
    pct.textContent = Math.round(state.scale[key] * 100) + "%";

    var plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.textContent = "A+";
    plusBtn.setAttribute("data-cat", key);
    plusBtn.setAttribute("data-step", "1");
    plusBtn.setAttribute("aria-label", "Increase " + LABELS[key] + " text size");

    sizeWrap.appendChild(minusBtn);
    sizeWrap.appendChild(pct);
    sizeWrap.appendChild(plusBtn);

    row.appendChild(label);
    row.appendChild(sizeWrap);
    panel.appendChild(row);
  });

  var resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "aa-reset";
  resetBtn.textContent = "Reset";
  panel.appendChild(resetBtn);

  panel.addEventListener("change", function (e) {
    var cb = e.target.closest('input[type="checkbox"][data-cat]');
    if (!cb) return;
    state.show[cb.getAttribute("data-cat")] = cb.checked;
    apply();
  });

  panel.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-cat]");
    if (btn) {
      var cat = btn.getAttribute("data-cat");
      var step = parseInt(btn.getAttribute("data-step"), 10) * 0.1;
      state.scale[cat] = clampScale(state.scale[cat] + step);
      var pctEl = panel.querySelector('.aa-pct[data-cat="' + cat + '"]');
      if (pctEl) pctEl.textContent = Math.round(state.scale[cat] * 100) + "%";
      apply();
      return;
    }
    if (e.target.classList.contains("aa-reset")) {
      state = defaultState();
      panel.querySelectorAll('input[type="checkbox"][data-cat]').forEach(function (cb) {
        cb.checked = true;
      });
      panel.querySelectorAll(".aa-pct").forEach(function (span) {
        span.textContent = "100%";
      });
      apply();
    }
  });

  function openPanel() {
    panel.hidden = false;
    toggleBtn.setAttribute("aria-expanded", "true");
    // Close the hamburger / mobile nav if it's open, so the two
    // dropdowns never stack on top of each other.
    var mobileNav = document.getElementById("main-nav-mobile");
    var navToggle = document.getElementById("nav-toggle");
    if (mobileNav && mobileNav.classList.contains("open")) {
      mobileNav.classList.remove("open");
      if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    }
  }

  function closePanel() {
    panel.hidden = true;
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  toggleBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (panel.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  });

  document.addEventListener("click", function (e) {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== toggleBtn) {
      closePanel();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) {
      closePanel();
      toggleBtn.focus();
    }
  });

  // If the hamburger menu is opened, close the Aa panel too.
  var navToggleEl = document.getElementById("nav-toggle");
  if (navToggleEl) {
    navToggleEl.addEventListener("click", function () {
      if (!panel.hidden) closePanel();
    });
  }

  apply();

  // Some pages (e.g. the Asma ul Husna grid and flashcards) render
  // their Arabic/transliteration/meaning content from JavaScript
  // after this script runs, so the first apply() above can run before
  // that content exists. Re-apply whenever the page's DOM changes so
  // newly-added content picks up the current settings automatically —
  // this also covers any future page that renders content this way.
  if (window.MutationObserver) {
    var reapplyScheduled = false;
    var observer = new MutationObserver(function () {
      if (reapplyScheduled) return;
      reapplyScheduled = true;
      (window.requestAnimationFrame || window.setTimeout)(function () {
        reapplyScheduled = false;
        apply();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
