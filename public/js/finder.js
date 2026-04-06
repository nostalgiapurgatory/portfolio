document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  var sidebarToggle = document.querySelector("[data-sidebar-toggle]");
  var sidebarCloseControls = document.querySelectorAll("[data-sidebar-close]");
  var folderToggles = document.querySelectorAll("[data-folder] .finder-folder-toggle");
  var themeButtons = document.querySelectorAll("[data-theme-option]");
  var themeStorageKey = "portfolio-theme";
  var galleryItems = document.querySelectorAll("[data-gallery-item]");
  var galleryWindow = document.querySelector("[data-gallery-window]");
  var galleryDismissControls = document.querySelectorAll("[data-gallery-dismiss]");
  var galleryImage = document.querySelector("[data-gallery-image]");
  var galleryTitle = document.querySelector("[data-gallery-title]");
  var clickableContentImages = document.querySelectorAll(".finder-document img, .finder-project-preview img");

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
    document.documentElement.setAttribute("data-theme", themeName);
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

  function closeGalleryWindow() {
    if (!galleryWindow || !galleryImage) {
      return;
    }

    galleryWindow.hidden = true;
    galleryImage.setAttribute("src", "");
    galleryImage.setAttribute("alt", "");
    body.classList.remove("finder-gallery-open");
  }

  function openGalleryWindow(trigger) {
    if (!galleryWindow || !galleryImage) {
      return;
    }

    var imageSrc = trigger.getAttribute("data-gallery-src");
    var imageTitle = trigger.getAttribute("data-gallery-title") || "Artwork Preview";

    galleryImage.setAttribute("src", imageSrc);
    galleryImage.setAttribute("alt", imageTitle);

    if (galleryTitle) {
      galleryTitle.textContent = imageTitle;
    }

    galleryWindow.hidden = false;
    body.classList.add("finder-gallery-open");
  }

  function getImageTitle(imageElement) {
    var figureCaption = imageElement.closest("figure");

    if (figureCaption) {
      var caption = figureCaption.querySelector("figcaption");

      if (caption && caption.textContent.trim()) {
        return caption.textContent.trim();
      }
    }

    if (imageElement.getAttribute("alt")) {
      return imageElement.getAttribute("alt");
    }

    return document.title || "Artwork Preview";
  }

  galleryItems.forEach(function (item) {
    item.addEventListener("click", function () {
      openGalleryWindow(item);
    });
  });

  clickableContentImages.forEach(function (image) {
    if (image.closest("[data-gallery-window]") || image.closest(".instagram-media")) {
      return;
    }

    image.addEventListener("click", function () {
      openGalleryWindow({
        getAttribute: function (name) {
          if (name === "data-gallery-src") {
            return image.currentSrc || image.getAttribute("src");
          }

          if (name === "data-gallery-title") {
            return getImageTitle(image);
          }

          return null;
        }
      });
    });
  });

  galleryDismissControls.forEach(function (control) {
    control.addEventListener("click", function () {
      closeGalleryWindow();
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

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeGalleryWindow();
    }
  });
});
