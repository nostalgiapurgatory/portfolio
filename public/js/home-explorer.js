document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  var themeToggle = document.querySelector("[data-home-theme-toggle]");
  var previewArt = document.querySelector("[data-home-preview-art]");
  var previewCaption = document.querySelector("[data-home-preview-caption]");
  var previewTriggers = document.querySelectorAll("[data-home-preview]");
  var previewNav = document.querySelector(".home-tree");
  var contactForm = document.querySelector("[data-home-contact-form]");
  var contactMessage = document.querySelector("[data-home-contact-message]");
  var contactStatus = document.querySelector("[data-home-contact-status]");
  var themeStorageKey = "home-explorer-theme";
  var folderStateStorageKey = "home-explorer-folder-state";
  var themeClass = "home-dark";
  var navFolders = document.querySelectorAll(".home-tree .home-folder[data-home-folder-id]");
  var navLinks = document.querySelectorAll(".home-tree .home-file-link[href]");
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
      html: [
        "<div class=\"home-featured-preview\">",
        "  <a class=\"home-featured-title\" href=\"/sculpture/\">",
        "    <span class=\"home-icon home-icon-folder\" aria-hidden=\"true\"></span>",
        "    <span>FEATURED PROJECTS</span>",
        "  </a>",
        "  <div class=\"home-featured-grid\">",
        "    <a class=\"home-featured-project\" href=\"/sculpture/\">",
        "      <img src=\"/assets/sculpture/sculpturethumbnail.png\" alt=\"Alfred Hitchcock sculpture thumbnail\">",
        "      <span>SCULPTURE</span>",
        "    </a>",
        "    <a class=\"home-featured-project\" href=\"/neotropolis/\">",
        "      <img src=\"/assets/neotropolis/2026/20260429_230355.jpg\" alt=\"Neotropolis thumbnail\">",
        "      <span>NEOTROPOLIS</span>",
        "    </a>",
        "    <a class=\"home-featured-project\" href=\"/voltavox/\">",
        "      <img src=\"/assets/voltavox/double-hero.jpg\" alt=\"Voltavox thumbnail\">",
        "      <span>VOLTAVOX</span>",
        "    </a>",
        "    <a class=\"home-featured-project\" href=\"/alleycats/\">",
        "      <img src=\"/assets/alleycats/alleycatspreview.png\" alt=\"Custom OLED Graphics thumbnail\">",
        "      <span>CUSTOM OLED GRAPHICS</span>",
        "    </a>",
        "    <a class=\"home-featured-project\" href=\"/nostalgiapurgatory/\">",
        "      <img src=\"/assets/nostalgiapurgatory/nphallwaythumbnail.png\" alt=\"Nostalgia Purgatory thumbnail\">",
        "      <span>NOSTALGIA PURGATORY</span>",
        "    </a>",
        "    <a class=\"home-featured-project\" href=\"/gather/\">",
        "      <img src=\"/assets/gather/500px_marketing_bookmeetings.png\" alt=\"Art Direction at Gather thumbnail\">",
        "      <span>ART DIRECTION AT GATHER</span>",
        "    </a>",
        "  </div>",
        "</div>"
      ].join("\n"),
      caption: ""
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
      html: [
        "<div class=\"home-featured-preview\">",
        "  <a class=\"home-featured-title\" href=\"/sculpture/\">",
        "    <span class=\"home-icon home-icon-folder\" aria-hidden=\"true\"></span>",
        "    <span>FEATURED PROJECTS</span>",
        "  </a>",
        "  <div class=\"home-featured-grid\">",
        "    <a class=\"home-featured-project\" href=\"/sculpture/\">",
        "      <img src=\"/assets/sculpture/sculpturethumbnail.png\" alt=\"Alfred Hitchcock sculpture thumbnail\">",
        "      <span>SCULPTURE</span>",
        "    </a>",
        "    <a class=\"home-featured-project\" href=\"/neotropolis/\">",
        "      <img src=\"/assets/neotropolis/2026/20260429_230355.jpg\" alt=\"Neotropolis thumbnail\">",
        "      <span>NEOTROPOLIS</span>",
        "    </a>",
        "    <a class=\"home-featured-project\" href=\"/voltavox/\">",
        "      <img src=\"/assets/voltavox/double-hero.jpg\" alt=\"Voltavox thumbnail\">",
        "      <span>VOLTAVOX</span>",
        "    </a>",
        "    <a class=\"home-featured-project\" href=\"/alleycats/\">",
        "      <img src=\"/assets/alleycats/alleycatspreview.png\" alt=\"Custom OLED Graphics thumbnail\">",
        "      <span>CUSTOM OLED GRAPHICS</span>",
        "    </a>",
        "    <a class=\"home-featured-project\" href=\"/nostalgiapurgatory/\">",
        "      <img src=\"/assets/nostalgiapurgatory/nphallwaythumbnail.png\" alt=\"Nostalgia Purgatory thumbnail\">",
        "      <span>NOSTALGIA PURGATORY</span>",
        "    </a>",
        "    <a class=\"home-featured-project\" href=\"/gather/\">",
        "      <img src=\"/assets/gather/500px_marketing_bookmeetings.png\" alt=\"Art Direction at Gather thumbnail\">",
        "      <span>ART DIRECTION AT GATHER</span>",
        "    </a>",
        "  </div>",
        "</div>"
      ].join("\n"),
      caption: ""
    },
    tarotPage: {
      art: [
        "  ___   ____      _    ____ _     _____    ____    _    ____  ____",
        " / _ \\ |  _ \\    / \\  / ___| |   | ____|  / ___|  / \\  |  _ \\|  _ \\",
        "| | | || |_) |  / _ \\| |   | |   |  _|   | |     / _ \\ | |_) | | | |",
        "| |_| ||  _ <  / ___ \\ |___| |___| |___  | |___ / ___ \\|  _ <| |_| |",
        " \\___/ |_| \\_\\/_/   \\_\\____|_____|_____|  \\____/_/   \\_\\_| \\_\\____/",
        "",
        "draw your ASCII fate."
      ].join("\n"),
      caption: "Open tarot.md to draw."
    },
    aboutPage: {
      art: [
        "about.md",
        "",
        "profile, history, and context"
      ].join("\n"),
      caption: "Artist overview."
    },
    resumePage: {
      art: [
        "resume.md",
        "",
        "structured resume for AI parsing"
      ].join("\n"),
      caption: "Open resume.md."
    },
    archivePage: {
      art: [
        "a collection of things on the internet I like"
      ].join("\n"),
      caption: "Open bygone-archive.md."
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
    mediaDirectory: {
      art: [
        "media/",
        "|-- Shaping the Fictional Reality",
        "`-- No Proscenium interview with Jaden Andrea"
      ].join("\n"),
      caption: "Articles and press links."
    },
    socialLink: {
      art: [
        "external_link.url",
        "",
        "opens in a new tab"
      ].join("\n"),
      caption: "External social destination."
    },
    mediaLink: {
      art: [
        "media_link.url",
        "",
        "opens in a new tab"
      ].join("\n"),
      caption: "External media feature."
    }
  };

  function setPreview(key) {
    var item = previews[key] || {};
    if (!previewArt || !previewCaption) {
      return;
    }

    if (item.html) {
      previewArt.innerHTML = item.html;
      previewArt.classList.add("home-preview-art-rich");
    } else {
      previewArt.textContent = item.art || previews.defaultArt;
      previewArt.classList.remove("home-preview-art-rich");
    }
    previewCaption.textContent = item.caption || previews.defaultCaption;
  }

  function isInternalPreviewLink(trigger) {
    var href = trigger.getAttribute("href") || "";
    return trigger.classList.contains("home-file-link") && href.charAt(0) === "/";
  }

  function getFileLabel(trigger) {
    var label = trigger.querySelector("span:last-child");
    return label ? label.textContent.trim() : "page";
  }

  function setLinkPreview(trigger) {
    var href = trigger.getAttribute("href") || "/";
    var title = getFileLabel(trigger);
    var thumbnail = trigger.getAttribute("data-home-thumbnail") || "/assets/jaden.jpg";
    var html = [
      "<div class=\"home-featured-preview\">",
      "  <a class=\"home-featured-title\" href=\"" + href + "\">",
      "    <span class=\"home-icon home-icon-folder\" aria-hidden=\"true\"></span>",
      "    <span>PAGE PREVIEW</span>",
      "  </a>",
      "  <div class=\"home-featured-grid\">",
      "    <a class=\"home-featured-project\" href=\"" + href + "\">",
      "      <img src=\"" + thumbnail + "\" alt=\"" + title.replace(/\"/g, "&quot;") + " thumbnail\">",
      "      <span>" + title + "</span>",
      "    </a>",
      "  </div>",
      "</div>"
    ].join("\n");

    previewArt.innerHTML = html;
    previewArt.classList.add("home-preview-art-rich");
    previewCaption.textContent = "";
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

  function normalizePathname(pathname) {
    var safePath = pathname || "/";
    return safePath.length > 1 ? safePath.replace(/\/+$/, "") : safePath;
  }

  function readFolderState() {
    try {
      var rawState = window.localStorage.getItem(folderStateStorageKey);
      var parsedState = rawState ? JSON.parse(rawState) : {};
      return parsedState && typeof parsedState === "object" ? parsedState : {};
    } catch (error) {
      return {};
    }
  }

  function writeFolderState(state) {
    try {
      window.localStorage.setItem(folderStateStorageKey, JSON.stringify(state));
    } catch (error) {
      /* Ignore storage errors. */
    }
  }

  function hydrateFolderState() {
    if (!navFolders.length) {
      return;
    }

    var savedState = readFolderState();

    navFolders.forEach(function (folder) {
      var folderId = folder.getAttribute("data-home-folder-id");
      if (!folderId || typeof savedState[folderId] !== "boolean") {
        return;
      }
      folder.open = savedState[folderId];
    });

    var currentPath = normalizePathname(window.location.pathname);
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) !== "/") {
        return;
      }

      var linkPath = normalizePathname(new URL(href, window.location.origin).pathname);
      if (linkPath !== currentPath) {
        return;
      }

      link.classList.add("is-active");
      var parentFolder = link.closest(".home-folder");
      while (parentFolder) {
        parentFolder.open = true;
        parentFolder = parentFolder.parentElement ? parentFolder.parentElement.closest(".home-folder") : null;
      }
    });
  }

  function bindFolderPersistence() {
    if (!navFolders.length) {
      return;
    }

    navFolders.forEach(function (folder) {
      folder.addEventListener("toggle", function () {
        var folderId = folder.getAttribute("data-home-folder-id");
        if (!folderId) {
          return;
        }
        var nextState = readFolderState();
        nextState[folderId] = folder.open;
        writeFolderState(nextState);
      });
    });
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

  hydrateFolderState();
  bindFolderPersistence();

  previewTriggers.forEach(function (trigger) {
    var key = trigger.getAttribute("data-home-preview");
    trigger.addEventListener("mouseenter", function () {
      if (isInternalPreviewLink(trigger)) {
        setLinkPreview(trigger);
        return;
      }
      setPreview(key);
    });
    trigger.addEventListener("focus", function () {
      if (isInternalPreviewLink(trigger)) {
        setLinkPreview(trigger);
        return;
      }
      setPreview(key);
    });
  });

  if (previewNav) {
    previewNav.addEventListener("mouseleave", function () {
      setPreview("projectFile");
    });

    previewNav.addEventListener("focusout", function () {
      if (!previewNav.contains(document.activeElement)) {
        setPreview("projectFile");
      }
    });
  }

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

  setPreview("projectFile");
});
