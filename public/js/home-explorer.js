document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  var themeToggle = document.querySelector("[data-home-theme-toggle]");
  var previewArt = document.querySelector("[data-home-preview-art]");
  var previewCaption = document.querySelector("[data-home-preview-caption]");
  var previewTriggers = document.querySelectorAll("[data-home-preview]");
  var contactForm = document.querySelector("[data-home-contact-form]");
  var contactMessage = document.querySelector("[data-home-contact-message]");
  var contactStatus = document.querySelector("[data-home-contact-status]");
  var themeStorageKey = "home-explorer-theme";
  var themeClass = "home-dark";
  var previews = {
    defaultArt: [
      "  .",
      " . .      simple explorer shell",
      "  .       hover folders to inspect",
      "",
      "  [root] home:/",
      "  [dir ] projects/",
      "  [dir ] connect/"
    ].join("\n"),
    defaultCaption: "Hover a folder or file to preview.",
    rootDirectory: {
      art: [
        "home:/",
        "|-- about.md",
        "|-- tarot.md",
        "`-- bygone-archive.md"
      ].join("\n"),
      caption: "Root pages."
    },
    projectsDirectory: {
      art: [
        "projects/",
        "|-- category folders",
        "|   `-- published project files"
      ].join("\n"),
      caption: "Published work grouped by category."
    },
    projectCategory: {
      art: [
        "category/",
        "|-- project_01.md",
        "|-- project_02.md",
        "`-- ..."
      ].join("\n"),
      caption: "Open to reveal project pages."
    },
    projectFile: {
      art: [
        "open file -> project page",
        "",
        "[preview handled by page route]"
      ].join("\n"),
      caption: "Open this file to visit the project."
    },
    tarotPage: {
      art: [
        "tarot.md",
        "",
        "separate route remains intact",
        "with card drawing interface"
      ].join("\n"),
      caption: "Tarot route is unchanged."
    },
    aboutPage: {
      art: [
        "about.md",
        "",
        "profile, history, and context"
      ].join("\n"),
      caption: "Artist overview."
    },
    archivePage: {
      art: [
        "bygone-archive.md",
        "",
        "older works and references"
      ].join("\n"),
      caption: "Archive entry point."
    },
    connectDirectory: {
      art: [
        "connect/",
        "|-- instagram.url",
        "|-- github.url",
        "`-- linkedin.url"
      ].join("\n"),
      caption: "External profile links."
    },
    socialLink: {
      art: [
        "external_link.url",
        "",
        "opens in a new tab"
      ].join("\n"),
      caption: "External social destination."
    }
  };

  function setPreview(key) {
    var item = previews[key] || {};
    if (!previewArt || !previewCaption) {
      return;
    }

    previewArt.textContent = item.art || previews.defaultArt;
    previewCaption.textContent = item.caption || previews.defaultCaption;
  }

  function applyTheme(themeName) {
    if (themeName === "dark") {
      body.classList.add(themeClass);
      if (themeToggle) {
        themeToggle.textContent = "dark mode: on";
        themeToggle.setAttribute("aria-pressed", "true");
      }
      return;
    }

    body.classList.remove(themeClass);
    if (themeToggle) {
      themeToggle.textContent = "dark mode: off";
      themeToggle.setAttribute("aria-pressed", "false");
    }
  }

  function getHiddenEmail() {
    var user = [110, 111, 115, 116, 97, 108, 103, 105, 97, 112, 117, 114, 103, 97, 116, 111, 114, 121];
    var domain = [103, 109, 97, 105, 108, 46, 99, 111, 109];

    return String.fromCharCode.apply(null, user) + "@" + String.fromCharCode.apply(null, domain);
  }

  try {
    var storedTheme = window.localStorage.getItem(themeStorageKey);
    applyTheme(storedTheme === "dark" ? "dark" : "light");
  } catch (error) {
    applyTheme("light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isDark = body.classList.contains(themeClass);
      var nextTheme = isDark ? "light" : "dark";
      applyTheme(nextTheme);

      try {
        window.localStorage.setItem(themeStorageKey, nextTheme);
      } catch (error) {
        /* Ignore storage errors. */
      }
    });
  }

  previewTriggers.forEach(function (trigger) {
    var key = trigger.getAttribute("data-home-preview");
    trigger.addEventListener("mouseenter", function () {
      setPreview(key);
    });
    trigger.addEventListener("focus", function () {
      setPreview(key);
    });
  });

  if (contactForm && contactMessage) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var message = contactMessage.value.trim();
      if (!message) {
        if (contactStatus) {
          contactStatus.textContent = "Please write a message first.";
        }
        return;
      }

      var recipient = getHiddenEmail();
      var subject = encodeURIComponent("Message from homepage explorer");
      var bodyContent = encodeURIComponent(message);
      var mailtoUrl = "mailto:" + recipient + "?subject=" + subject + "&body=" + bodyContent;

      if (contactStatus) {
        contactStatus.textContent = "Opening your mail app...";
      }

      window.location.href = mailtoUrl;
    });
  }

  setPreview("default");
});
