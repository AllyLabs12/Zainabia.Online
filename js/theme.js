/**
 * Theme controller: four static themes (white / zaitoon / night / cherry).
 * No date logic — the visitor's own choice persists in localStorage.
 */
(function () {
  const STORAGE_KEY = "zainabia-theme";
  const DEFAULT_THEME = "white";
  const VALID_THEMES = ["white", "zaitoon", "night", "cherry"];
  const root = document.documentElement;

  function applyTheme(choice) {
    const resolved = VALID_THEMES.includes(choice) ? choice : DEFAULT_THEME;
    root.setAttribute("data-theme", resolved);
  }

  function getStoredChoice() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  }

  function setChoice(choice) {
    localStorage.setItem(STORAGE_KEY, choice);
    applyTheme(choice);
    highlightActive(choice);
  }

  function highlightActive(choice) {
    document.querySelectorAll("[data-theme-choice]").forEach((btn) => {
      btn.style.color =
        btn.getAttribute("data-theme-choice") === choice
          ? "var(--accent-soft)"
          : "";
    });
  }

  window.ZainabiaTheme = { applyTheme, setChoice, getStoredChoice };

  // Apply immediately (before DOMContentLoaded) to avoid a flash of the wrong theme.
  applyTheme(getStoredChoice());
})();
