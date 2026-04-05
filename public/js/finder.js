document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  var sidebarToggle = document.querySelector("[data-sidebar-toggle]");
  var sidebarCloseControls = document.querySelectorAll("[data-sidebar-close]");
  var folderToggles = document.querySelectorAll("[data-folder] .finder-folder-toggle");
  var themeButtons = document.querySelectorAll("[data-theme-option]");
  var themeStorageKey = "portfolio-theme";

  function setSidebarState(isOpen) {
    body.classList.toggle("finder-sidebar-open", isOpen);

    if (sidebarToggle) {
      sidebarToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      setSidebarState(!body.classList.contains("finder-sidebar-open"));
    });
  }

  function setTheme(themeName) {
    body.setAttribute("data-theme", themeName);

    themeButtons.forEach(function (button) {
      var isActive = button.getAttribute("data-theme-option") === themeName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    try {
      window.localStorage.setItem(themeStorageKey, themeName);
    } catch (error) {
      /* Ignore storage issues and keep the selected theme in memory only. */
    }
  }

  function getSavedTheme() {
    try {
      return window.localStorage.getItem(themeStorageKey);
    } catch (error) {
      return null;
    }
  }

  var savedTheme = getSavedTheme();
  if (savedTheme) {
    setTheme(savedTheme);
  }

  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setTheme(button.getAttribute("data-theme-option"));
    });
  });

  sidebarCloseControls.forEach(function (control) {
    control.addEventListener("click", function () {
      setSidebarState(false);
    });
  });

  folderToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var folder = toggle.closest("[data-folder]");

      if (!folder) {
        return;
      }

      var isOpen = folder.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 960) {
      setSidebarState(false);
    }
  });
});
