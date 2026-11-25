/**
 * Asma ul Husna page — renders the 99-name grid (with search + expandable
 * detail) and the flashcard deck. Data comes from asma-ul-husna-data.js
 * (window.ASMA_UL_HUSNA / ASMA_UL_HUSNA).
 */
(function () {
  const DATA = (typeof ASMA_UL_HUSNA !== "undefined") ? ASMA_UL_HUSNA : [];
  const LEARNED_KEY = "zainabia-asma-learned";

  function getLearned() {
    try {
      return new Set(JSON.parse(localStorage.getItem(LEARNED_KEY) || "[]"));
    } catch (e) {
      return new Set();
    }
  }
  function saveLearned(set) {
    try {
      localStorage.setItem(LEARNED_KEY, JSON.stringify(Array.from(set)));
    } catch (e) {
      /* ignore — storage may be unavailable */
    }
  }

  /* ---------------------------------------------------------------- */
  /* Names grid                                                        */
  /* ---------------------------------------------------------------- */
  function renderGrid() {
    const grid = document.getElementById("ah-grid");
    const countEl = document.getElementById("ah-count");
    const searchInput = document.getElementById("ah-search");
    if (!grid) return;

    function cardHTML(item) {
      return (
        '<div class="ah-card" data-n="' + item.n + '" data-search="' +
        (item.en + " " + item.ur + " " + item.meaning + " " + (item.urm || "")).toLowerCase().replace(/"/g, "&quot;") +
        '">' +
          '<div class="ah-card-head">' +
            '<span class="ah-badge">' + item.n + "</span>" +
            '<span class="ah-ar" lang="ar" dir="rtl">' + item.ar + "</span>" +
          "</div>" +
          '<p class="ah-ur">' + item.ur + "</p>" +
          '<h3 class="ah-en">' + item.en + "</h3>" +
          '<p class="ah-meaning">' + item.meaning + "</p>" +
          (item.urm ? '<p class="ah-urm">' + item.urm + " <span>(Urdu)</span></p>" : "") +
          '<button class="ah-more" type="button" aria-expanded="false">More detail +</button>' +
          '<div class="ah-detail" hidden>' +
            (item.explain ? "<p>" + item.explain + "</p>" : "") +
            (item.qref ? '<p class="ah-detail-row"><b>Qur’an:</b> ' + item.qref + "</p>" : "") +
            (item.benefit ? '<p class="ah-detail-row"><b>Benefit of recitation:</b> ' + item.benefit + "</p>" : "") +
          "</div>" +
        "</div>"
      );
    }

    grid.innerHTML = DATA.map(cardHTML).join("");
    if (countEl) countEl.textContent = DATA.length;

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".ah-more");
      if (!btn) return;
      const card = btn.closest(".ah-card");
      const detail = card.querySelector(".ah-detail");
      const open = !detail.hidden;
      detail.hidden = open;
      btn.setAttribute("aria-expanded", String(!open));
      btn.textContent = open ? "More detail +" : "Less detail −";
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim().toLowerCase();
        let shown = 0;
        grid.querySelectorAll(".ah-card").forEach((card) => {
          const match = !q || card.getAttribute("data-search").includes(q);
          card.style.display = match ? "" : "none";
          if (match) shown++;
        });
        if (countEl) countEl.textContent = shown;
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Flashcards                                                        */
  /* ---------------------------------------------------------------- */
  function renderFlashcards() {
    const stage = document.getElementById("ah-fc-stage");
    if (!stage) return;

    let order = DATA.map((d) => d.n - 1);
    let pos = 0;
    let flipped = false;
    let learned = getLearned();

    const cardEl = document.getElementById("ah-fc-card");
    const posEl = document.getElementById("ah-fc-pos");
    const learnedEl = document.getElementById("ah-fc-learned");
    const learnBtn = document.getElementById("ah-fc-learn");
    const flipBtn = document.getElementById("ah-fc-flip");
    const prevBtn = document.getElementById("ah-fc-prev");
    const nextBtn = document.getElementById("ah-fc-next");
    const shuffleBtn = document.getElementById("ah-fc-shuffle");

    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function render() {
      const item = DATA[order[pos]];
      cardEl.classList.toggle("is-flipped", flipped);
      cardEl.innerHTML =
        '<div class="ah-fc-face ah-fc-front">' +
          '<span class="ah-badge">' + item.n + "</span>" +
          '<span class="ah-fc-ar" lang="ar" dir="rtl">' + item.ar + "</span>" +
          '<span class="ah-fc-hint">Tap to reveal</span>' +
        "</div>" +
        '<div class="ah-fc-face ah-fc-back">' +
          '<p class="ah-ur">' + item.ur + "</p>" +
          '<h3 class="ah-en">' + item.en + "</h3>" +
          '<p class="ah-meaning">' + item.meaning + "</p>" +
          (item.urm ? '<p class="ah-urm">' + item.urm + " <span>(Urdu)</span></p>" : "") +
        "</div>";
      posEl.textContent = (pos + 1) + " / " + order.length;
      learnedEl.textContent = learned.size + " learned";
      learnBtn.textContent = learned.has(item.n) ? "✓ Learned" : "Mark as learned";
      learnBtn.classList.toggle("is-on", learned.has(item.n));
    }

    function flip() {
      flipped = !flipped;
      cardEl.classList.toggle("is-flipped", flipped);
    }
    function go(delta) {
      pos = (pos + delta + order.length) % order.length;
      flipped = false;
      render();
    }

    cardEl.addEventListener("click", flip);
    flipBtn.addEventListener("click", flip);
    nextBtn.addEventListener("click", () => go(1));
    prevBtn.addEventListener("click", () => go(-1));
    shuffleBtn.addEventListener("click", () => {
      order = shuffle(order);
      pos = 0;
      flipped = false;
      render();
    });
    learnBtn.addEventListener("click", () => {
      const item = DATA[order[pos]];
      if (learned.has(item.n)) learned.delete(item.n);
      else learned.add(item.n);
      saveLearned(learned);
      render();
    });

    document.addEventListener("keydown", (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") { e.preventDefault(); flip(); }
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderGrid();
    renderFlashcards();
  });
})();
