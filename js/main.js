document.addEventListener("DOMContentLoaded", () => {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme menu toggle
  const themeToggle = document.getElementById("theme-toggle");
  const themeMenu = document.getElementById("theme-menu");
  if (themeToggle && themeMenu) {
    window.ZainabiaTheme.applyTheme(window.ZainabiaTheme.getStoredChoice());

    themeToggle.addEventListener("click", () => {
      const open = themeMenu.hidden === false;
      themeMenu.hidden = open;
      themeToggle.setAttribute("aria-expanded", String(!open));
    });

    document.querySelectorAll("[data-theme-choice]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.ZainabiaTheme.setChoice(btn.getAttribute("data-theme-choice"));
        themeMenu.hidden = true;
        themeToggle.setAttribute("aria-expanded", "false");
      });
      // Live preview: hovering a swatch shows that theme instantly;
      // moving away without clicking reverts to the saved choice.
      btn.addEventListener("mouseenter", () => {
        window.ZainabiaTheme.applyTheme(btn.getAttribute("data-theme-choice"));
      });
      btn.addEventListener("mouseleave", () => {
        window.ZainabiaTheme.applyTheme(window.ZainabiaTheme.getStoredChoice());
      });
      btn.addEventListener("focus", () => {
        window.ZainabiaTheme.applyTheme(btn.getAttribute("data-theme-choice"));
      });
      btn.addEventListener("blur", () => {
        window.ZainabiaTheme.applyTheme(window.ZainabiaTheme.getStoredChoice());
      });
    });

    document.addEventListener("click", (e) => {
      if (!themeMenu.contains(e.target) && e.target !== themeToggle) {
        themeMenu.hidden = true;
        themeToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Mobile nav toggle
  const navToggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("main-nav-mobile");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }
});
