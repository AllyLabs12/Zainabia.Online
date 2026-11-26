/*
 * Display settings for Articles & Lessons pages: lets a reader
 * independently show/hide and resize four kinds of text —
 * English (general page text), Arabic, Transliteration, and
 * Meaning (the translation attached to a quoted Arabic phrase).
 *
 * Works on any page that has an <article class="aiq-article"> or
 * <article class="nj-article"> plus a #art-controls-panel element.
 * Settings persist per page via localStorage.
 */
(function () {
  var article = document.querySelector(".aiq-article, .nj-article");
  var panel = document.getElementById("art-controls-panel");
  var toggleBtn = document.getElementById("art-controls-toggle");
  if (!article || !panel) return;

  var prefix = article.classList.contains("aiq-article") ? "aiq" : "nj";
  var storageKey = "zainabia-display-" + prefix;

  var CATEGORY_ORDER = ["general", "ar", "translit", "meaning"];
  var LABELS = {
    general: "English",
    ar: "Arabic",
    translit: "Transliteration",
    meaning: "Meaning"
  };

  var SELECTORS = {
    aiq: {
      general:
        '.aiq-article > h2, .aiq-article > h3, .aiq-article > p, .aiq-article li, table.aiq-table th, .aiq-count, .aiq-general',
      ar: '.aiq-ar, .aiq-ar-cell',
      translit: '.aiq-translit, .aiq-glance-phrase',
      meaning:
        'table.aiq-table tbody td:nth-child(3), .aiq-urdu, .aiq-glance-item p, .aiq-meaning'
    },
    nj: {
      general:
        '.nj-article h2, .nj-article h3, .nj-article h4, .nj-article > p, .nj-article li, .nj-omit-item, .nj-label, .nj-level, table.nj-table th, table.nj-table td:not(.nj-translit-cell), .nj-general',
      ar: '.nj-ar',
      translit: '.nj-translit, table.nj-table .nj-translit-cell',
      meaning: '.nj-meaning'
    }
  };

  var selectors = SELECTORS[prefix];

  function defaultState() {
    var show = {};
    var scale = {};
    CATEGORY_ORDER.forEach(function (key) {
      show[key] = true;
      scale[key] = 1;
    });
    return { show: show, scale: scale };
  }

  var state = defaultState();
  try {
    var saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (saved && saved.show && saved.scale) state = saved;
  } catch (e) {
    /* ignore — fall back to defaults */
  }

  function clampScale(n) {
    return Math.max(0.7, Math.min(1.8, Math.round(n * 100) / 100));
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable — settings just won't persist */
    }
  }

  function apply() {
    CATEGORY_ORDER.forEach(function (key) {
      document.documentElement.style.setProperty(
        "--" + prefix + "-scale-" + key,
        state.scale[key]
      );
      var els = document.querySelectorAll(selectors[key]);
      els.forEach(function (el) {
        el.style.display = state.show[key] ? "" : "none";
      });
    });
    persist();
  }

  // Build the panel UI
  CATEGORY_ORDER.forEach(function (key) {
    var row = document.createElement("div");
    row.className = "art-controls-row";

    var label = document.createElement("label");
    label.className = "art-controls-check";
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.show[key];
    checkbox.setAttribute("data-cat", key);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + LABELS[key]));

    var sizeWrap = document.createElement("div");
    sizeWrap.className = "art-controls-size";

    var minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.textContent = "A−";
    minusBtn.setAttribute("data-cat", key);
    minusBtn.setAttribute("data-step", "-1");
    minusBtn.setAttribute("aria-label", "Decrease " + LABELS[key] + " text size");

    var pct = document.createElement("span");
    pct.className = "art-controls-pct";
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
  resetBtn.className = "art-controls-reset";
  resetBtn.textContent = "Reset to defaults";
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
      var pctEl = panel.querySelector('.art-controls-pct[data-cat="' + cat + '"]');
      if (pctEl) pctEl.textContent = Math.round(state.scale[cat] * 100) + "%";
      apply();
      return;
    }
    if (e.target.classList.contains("art-controls-reset")) {
      state = defaultState();
      panel.querySelectorAll('input[type="checkbox"][data-cat]').forEach(function (cb) {
        cb.checked = true;
      });
      panel.querySelectorAll(".art-controls-pct").forEach(function (span) {
        span.textContent = "100%";
      });
      apply();
    }
  });

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var expanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  apply();
})();
