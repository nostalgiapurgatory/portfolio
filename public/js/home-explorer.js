document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  var themeToggle = document.querySelector("[data-home-theme-toggle]");
  var navToggle = document.querySelector("[data-home-nav-toggle]");
  var navPanel = document.querySelector("[data-home-nav-panel]");
  var navCloseControls = document.querySelectorAll("[data-home-nav-close]");
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
  var mobileNavBreakpoint = 900;
  var galleryLimit = 8;
  var galleryCache = Object.create(null);
  // These stay collapsed on every page load unless the current URL lives inside
  // them. Saved open/closed state still applies to every other folder.
  var collapsedOnLoadFolderIds = {
    "projects-immersive-art-design-fabrication": true,
    "projects-blue-sky-concept-art": true,
    "projects-digital-illustration": true,
    "projects-fine-art": true,
    "projects-interior-architecture": true
  };
  // Bumped on every preview swap so a slow gallery fetch can tell whether the
  // pane it was started for is still the one on screen.
  var previewToken = 0;
  function setHomeNavOpen(isOpen) {
    body.classList.toggle("home-nav-open", isOpen);
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
    if (navPanel) {
      var shouldHidePanel = window.innerWidth <= mobileNavBreakpoint && !isOpen;
      navPanel.setAttribute("aria-hidden", shouldHidePanel ? "true" : "false");
    }
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setHomeNavOpen(!body.classList.contains("home-nav-open"));
    });
  }

  navCloseControls.forEach(function (control) {
    control.addEventListener("click", function () {
      setHomeNavOpen(false);
    });
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.innerWidth <= mobileNavBreakpoint) {
        setHomeNavOpen(false);
      }
    });
  });

  function initializePcbViewer() {
    var viewerRoot = document.querySelector("[data-pcb-viewer]");
    var canvas;
    var stage;
    var tabs;
    var views;
    var downloadUrl;
    var downloadName;
    var downloadButton;
    var activePointers = Object.create(null);
    var zoomScale = 1;
    var panX = 0;
    var panY = 0;
    var maxZoom = 3.6;
    var minZoom = 0.75;
    var dragStartX = 0;
    var dragStartY = 0;
    var lastCenterX = 0;
    var lastCenterY = 0;
    var pinchStartDistance = 0;
    var pinchStartZoom = 1;

    if (!viewerRoot) {
      return;
    }

    canvas = viewerRoot.querySelector("[data-pcb-canvas]");
    stage = viewerRoot.querySelector("[data-pcb-stage]");
    tabs = viewerRoot.querySelectorAll("[data-pcb-tab]");
    views = viewerRoot.querySelectorAll("[data-pcb-view]");
    downloadUrl = viewerRoot.getAttribute("data-pcb-download");
    downloadName = viewerRoot.getAttribute("data-pcb-download-name") || "jadenandrea_designs_boards_too_rev00.zip";
    downloadButton = viewerRoot.querySelector("[data-pcb-download-button]");

    if (!canvas || !stage) {
      return;
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    // Board SVG viewBox, in millimetres. Mirrors the constants in
    // scripts/render-business-card-pcb.mjs and the canvas aspect-ratio.
    var gridStepMm = 5;
    var viewMm = { x: -10.1, y: -8.2, width: 68.9, height: 104.7 };

    // The canvas paints the dot grid so it always reaches the panel borders,
    // which means we have to reproduce the stage transform on the background.
    function applyGrid() {
      var width = canvas.clientWidth;
      var height = canvas.clientHeight;
      var pxPerMm;
      var step;
      var centerX;
      var centerY;
      var originX;
      var originY;

      if (!width || !height) {
        return;
      }

      // object-fit: contain, so the SVG uses the smaller of the two scales.
      pxPerMm = Math.min(width / viewMm.width, height / viewMm.height);
      step = gridStepMm * pxPerMm;
      centerX = width / 2;
      centerY = height / 2;

      // First lattice point at or before each viewBox edge, in unzoomed pixels.
      originX = ((width - (viewMm.width * pxPerMm)) / 2) +
        ((((Math.floor(viewMm.x / gridStepMm) * gridStepMm) - viewMm.x)) * pxPerMm);
      originY = ((height - (viewMm.height * pxPerMm)) / 2) +
        ((((Math.floor(viewMm.y / gridStepMm) * gridStepMm) - viewMm.y)) * pxPerMm);

      canvas.style.setProperty("--home-pcb-grid-size", (step * zoomScale) + "px");
      canvas.style.setProperty("--home-pcb-grid-x", (centerX + ((originX - centerX) * zoomScale) + panX) + "px");
      canvas.style.setProperty("--home-pcb-grid-y", (centerY + ((originY - centerY) * zoomScale) + panY) + "px");
    }

    // Keep part of the board on screen. Zooming in adds slack because the
    // scaled stage overflows the canvas and those edges have to stay reachable.
    function clampPan() {
      var width = canvas.clientWidth;
      var height = canvas.clientHeight;
      var slackX = Math.max(0, ((width * zoomScale) - width) / 2) + (width * 0.35);
      var slackY = Math.max(0, ((height * zoomScale) - height) / 2) + (height * 0.35);

      panX = clamp(panX, -slackX, slackX);
      panY = clamp(panY, -slackY, slackY);
    }

    function applyTransform() {
      clampPan();
      stage.style.transform = "translate(" + panX + "px, " + panY + "px) scale(" + zoomScale + ")";
      applyGrid();
    }

    function resetTransform() {
      zoomScale = 1;
      panX = 0;
      panY = 0;
      applyTransform();
    }

    function showView(name) {
      canvas.classList.toggle("has-grid", name === "pcbnew");
      views.forEach(function (view) {
        view.classList.toggle("is-active", view.getAttribute("data-pcb-view") === name);
      });
      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute("data-pcb-tab") === name;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });
      resetTransform();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        showView(tab.getAttribute("data-pcb-tab"));
      });
    });

    function getPointerArray() {
      return Object.keys(activePointers).map(function (key) {
        return activePointers[key];
      });
    }

    function getDistance(first, second) {
      var dx = first.x - second.x;
      var dy = first.y - second.y;
      return Math.sqrt((dx * dx) + (dy * dy));
    }

    function getCenter(first, second) {
      return {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2
      };
    }

    function triggerDownload() {
      var link;
      if (!downloadUrl) {
        return;
      }

      link = document.createElement("a");
      link.href = downloadUrl;
      link.download = downloadName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    canvas.addEventListener("wheel", function (event) {
      event.preventDefault();
      zoomScale = clamp(zoomScale + (event.deltaY < 0 ? 0.12 : -0.12), minZoom, maxZoom);
      applyTransform();
    }, { passive: false });

    canvas.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      // Without this the browser starts a native drag of the board image and
      // the pan dies partway through the gesture.
      event.preventDefault();

      activePointers[event.pointerId] = { x: event.clientX, y: event.clientY };
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      canvas.classList.add("is-panning");
      canvas.setPointerCapture(event.pointerId);

      if (getPointerArray().length === 2) {
        var pointers = getPointerArray();
        var center = getCenter(pointers[0], pointers[1]);
        pinchStartDistance = getDistance(pointers[0], pointers[1]);
        pinchStartZoom = zoomScale;
        lastCenterX = center.x;
        lastCenterY = center.y;
      }
    });

    canvas.addEventListener("pointermove", function (event) {
      var pointers;
      var first;
      var second;
      var center;
      var nextDistance;
      var movementX;
      var movementY;

      if (!activePointers[event.pointerId]) {
        return;
      }

      activePointers[event.pointerId] = { x: event.clientX, y: event.clientY };
      pointers = getPointerArray();

      if (pointers.length >= 2) {
        first = pointers[0];
        second = pointers[1];
        center = getCenter(first, second);
        nextDistance = getDistance(first, second);

        if (!pinchStartDistance) {
          pinchStartDistance = nextDistance;
          pinchStartZoom = zoomScale;
        }

        zoomScale = clamp(pinchStartZoom * (nextDistance / pinchStartDistance), minZoom, maxZoom);
        panX += center.x - lastCenterX;
        panY += center.y - lastCenterY;
        lastCenterX = center.x;
        lastCenterY = center.y;
      } else {
        movementX = event.clientX - dragStartX;
        movementY = event.clientY - dragStartY;
        panX += movementX;
        panY += movementY;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
      }

      applyTransform();
    });

    function stopPan(event) {
      var pointerCount;
      var remaining;

      if (event && activePointers[event.pointerId]) {
        delete activePointers[event.pointerId];
      }

      if (event && typeof event.pointerId === "number" && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      pointerCount = getPointerArray().length;

      if (pointerCount < 2) {
        pinchStartDistance = 0;
        pinchStartZoom = zoomScale;
      }

      if (pointerCount === 1) {
        // Coming out of a pinch, re-anchor to the finger that is still down so
        // the next move does not replay the whole gesture as one jump.
        remaining = getPointerArray()[0];
        dragStartX = remaining.x;
        dragStartY = remaining.y;
      }

      if (!pointerCount) {
        canvas.classList.remove("is-panning");
      }
    }

    canvas.addEventListener("pointerup", stopPan);
    canvas.addEventListener("pointercancel", stopPan);
    canvas.addEventListener("lostpointercapture", stopPan);

    if (downloadButton) {
      downloadButton.addEventListener("click", triggerDownload);
    }

    window.addEventListener("resize", applyGrid);

    var initialView = viewerRoot.querySelector("[data-pcb-view].is-active");
    canvas.classList.toggle(
      "has-grid",
      !!initialView && initialView.getAttribute("data-pcb-view") === "pcbnew"
    );
    applyTransform();
  }

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

    previewToken += 1;

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

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildProjectCard(link) {
    var href = link.getAttribute("href") || "/";
    var title = escapeHtml(getFileLabel(link));
    var thumbnail = link.getAttribute("data-home-thumbnail") || "/assets/img/jaden.jpg";

    return [
      "    <a class=\"home-featured-project\" href=\"" + escapeHtml(href) + "\">",
      "      <img src=\"" + escapeHtml(thumbnail) + "\" alt=\"" + title + " thumbnail\">",
      "      <span>" + title + "</span>",
      "    </a>"
    ].join("\n");
  }

  // Pick up to `limit` items spaced evenly through the list, keeping page order
  // and always including the first and last when there are enough photos to fill.
  function sampleEvenly(items, limit) {
    var count = items.length;
    var picked = [];
    var lastIndex = -1;
    var i;
    var index;

    if (count <= limit) {
      return items.slice();
    }

    if (limit === 1) {
      return [items[Math.floor((count - 1) / 2)]];
    }

    for (i = 0; i < limit; i += 1) {
      index = Math.round(i * (count - 1) / (limit - 1));
      if (index === lastIndex) {
        index = Math.min(count - 1, lastIndex + 1);
      }
      lastIndex = index;
      picked.push(items[index]);
    }

    return picked;
  }

  // A label-less card used to pad a single-page preview out with photos pulled
  // from the page itself. Clicking one still opens the page.
  function buildGalleryTile(href, image) {
    return [
      "    <a class=\"home-featured-project home-featured-tile\" href=\"" + escapeHtml(href) + "\">",
      "      <img src=\"" + escapeHtml(image.src) + "\" alt=\"" + escapeHtml(image.alt) + "\" loading=\"lazy\">",
      "    </a>"
    ].join("\n");
  }

  // Reads the linked page's own markup for its content images. Same-origin and
  // cached per href, so only the first hover on a link costs a request.
  function loadPageImages(href) {
    if (galleryCache[href]) {
      return galleryCache[href];
    }

    galleryCache[href] = window.fetch(href, {credentials: "same-origin"})
      .then(function (response) {
        if (!response.ok) {
          throw new Error("preview fetch failed");
        }
        return response.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var scope = doc.querySelector(".finder-document") || doc.body;
        var base = new URL(href, window.location.href);
        var seen = Object.create(null);
        var images = [];

        Array.prototype.forEach.call(scope.querySelectorAll("img"), function (img) {
          var raw = img.getAttribute("src");
          // A page steers its own hover preview with data-home-gallery:
          // "skip" keeps an image out, "lead" pins it to the front.
          var role = img.getAttribute("data-home-gallery");
          var src;

          if (!raw || role === "skip") {
            return;
          }

          src = new URL(raw, base).href;
          if (seen[src]) {
            return;
          }

          seen[src] = true;
          images.push({src: src, alt: img.getAttribute("alt") || "", lead: role === "lead"});
        });

        return images;
      })
      .catch(function () {
        return [];
      });

    return galleryCache[href];
  }

  function renderPreviewGrid(heading, cards) {
    previewToken += 1;
    previewArt.innerHTML = [
      "<div class=\"home-featured-preview\">",
      "  " + heading,
      "  <div class=\"home-featured-grid\">",
      cards.join("\n"),
      "  </div>",
      "</div>"
    ].join("\n");
    previewArt.classList.add("home-preview-art-rich");
    previewCaption.textContent = "";
  }

  // One card is a lot of empty pane, so the rest of the grid gets filled in with
  // photos fetched from the page behind the link once they arrive.
  function setLinkPreview(trigger) {
    var href = trigger.getAttribute("href") || "/";
    var thumbnail = trigger.getAttribute("data-home-thumbnail") || "";
    var heading = [
      "<a class=\"home-featured-title\" href=\"" + escapeHtml(href) + "\">",
      "    <span class=\"home-icon home-icon-folder\" aria-hidden=\"true\"></span>",
      "    <span>PAGE PREVIEW</span>",
      "  </a>"
    ].join("\n  ");
    var token;

    renderPreviewGrid(heading, [buildProjectCard(trigger)]);

    if (typeof window.fetch !== "function") {
      return;
    }

    token = previewToken;
    loadPageImages(href).then(function (images) {
      var thumbnailSrc = thumbnail ? new URL(thumbnail, window.location.href).href : "";
      var candidates = images.filter(function (image) {
        return image.src !== thumbnailSrc;
      });
      // Pinned images always make the cut; the rest are sampled into whatever
      // room is left.
      var lead = candidates.filter(function (image) {
        return image.lead;
      }).slice(0, galleryLimit);
      var rest = candidates.filter(function (image) {
        return !image.lead;
      });
      var tiles = lead.concat(sampleEvenly(rest, galleryLimit - lead.length)).map(function (image) {
        return buildGalleryTile(href, image);
      });

      if (token !== previewToken || !tiles.length) {
        return;
      }

      renderPreviewGrid(heading, [buildProjectCard(trigger)].concat(tiles));
    });
  }

  // Hovering a category shows a card for every project underneath it, including
  // the ones in nested sub-folders. <details> keeps its children in the DOM when
  // collapsed, so this works whether or not the folder is open.
  function setFolderPreview(summary) {
    var folder = summary.closest("details");
    var cards = [];
    var heading;

    if (folder) {
      Array.prototype.forEach.call(folder.querySelectorAll(".home-file-link"), function (link) {
        if (isInternalPreviewLink(link)) {
          cards.push(buildProjectCard(link));
        }
      });
    }

    if (!cards.length) {
      setPreview("projectCategory");
      return;
    }

    heading = [
      "<span class=\"home-featured-title\">",
      "    <span class=\"home-icon home-icon-folder\" aria-hidden=\"true\"></span>",
      "    <span>" + escapeHtml(getFileLabel(summary).toUpperCase()) + "</span>",
      "  </span>"
    ].join("\n  ");

    renderPreviewGrid(heading, cards);
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
      if (!folderId) {
        return;
      }
      if (collapsedOnLoadFolderIds[folderId]) {
        folder.open = false;
        return;
      }
      if (typeof savedState[folderId] !== "boolean") {
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
  setHomeNavOpen(false);

  previewTriggers.forEach(function (trigger) {
    var key = trigger.getAttribute("data-home-preview");

    function showPreview() {
      if (isInternalPreviewLink(trigger)) {
        setLinkPreview(trigger);
        return;
      }
      if (key === "projectCategory") {
        setFolderPreview(trigger);
        return;
      }
      setPreview(key);
    }

    trigger.addEventListener("mouseenter", showPreview);
    trigger.addEventListener("focus", showPreview);
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

  window.addEventListener("resize", function () {
    if (window.innerWidth > mobileNavBreakpoint) {
      setHomeNavOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }

    if (body.classList.contains("home-nav-open")) {
      setHomeNavOpen(false);
      if (navToggle) {
        navToggle.focus();
      }
    }
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

  initializePcbViewer();
  setPreview("projectFile");
});
