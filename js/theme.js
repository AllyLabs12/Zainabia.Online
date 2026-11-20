/**
 * Theme controller: three themes (green / black / maroon), gold constant accent.
 * "auto" mode picks a theme based on the Hijri calendar date (mourning vs
 * joyous occasions); a manual choice overrides auto until the user picks
 * "Auto" again. Choice persists in localStorage.
 */
(function () {
  const STORAGE_KEY = "zainabia-theme";
  const root = document.documentElement;

  // Mourning windows: [month, startDay, endDay]
  const MOURNING = [
    [1, 1, 10],   // Muharram 1–10 (Ashura)
    [1, 11, 29],  // rest of Muharram
    [2, 1, 20],   // Safar 1–20 (Arbaeen)
    [2, 28, 28],  // 28 Safar
    [3, 17, 17],  // some observe early Rabi' al-Awwal mourning dates vary; conservative single day
  ];

  // Joyous occasions: [month, startDay, endDay]
  const OCCASIONS = [
    [8, 15, 15],   // 15 Sha'ban — birth of Imam al-Mahdi (AS)
    [9, 1, 1],     // placeholder: adjust per local observance
    [10, 1, 2],    // Eid al-Fitr
    [12, 9, 10],   // Eid al-Adha
    [12, 18, 18],  // Eid al-Ghadeer
  ];

  function inWindow(hijri, windows) {
    return windows.some(
      ([m, start, end]) =>
        hijri.month === m && hijri.day >= start && hijri.day <= end
    );
  }

  function autoTheme() {
    try {
      const hijri = window.ZainabiaHijri.gregorianToHijri(new Date());
      if (inWindow(hijri, MOURNING)) return "black";
      if (inWindow(hijri, OCCASIONS)) return "maroon";
      return "green";
    } catch (e) {
      return "green";
    }
  }

  function applyTheme(choice) {
    const resolved = choice === "auto" ? autoTheme() : choice;
    root.setAttribute("data-theme", resolved);
  }

  function getStoredChoice() {
    return localStorage.getItem(STORAGE_KEY) || "auto";
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
