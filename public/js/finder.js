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
  var galleryPrevControl = document.querySelector("[data-gallery-prev]");
  var galleryNextControl = document.querySelector("[data-gallery-next]");
  var clickableContentImages = document.querySelectorAll(".finder-document img, .finder-project-preview img, .home-preview img");
  var gallerySequence = [];
  var galleryIndex = -1;
  var shouldSyncTheme = body.getAttribute("data-disable-theme-sync") !== "true";
  var paperHeaderSelector = [
    ".finder-window-title",
    ".finder-sidebar-title",
    ".finder-sidebar-title a",
    ".finder-pane-header h1",
    ".finder-card-header h2",
    ".finder-folder-card h3",
    ".finder-document h1",
    ".finder-document h2",
    ".finder-document h3",
    ".finder-document h4",
    ".finder-document h5",
    ".finder-document h6",
    ".finder-paper-crest-ribbon-top",
    ".finder-paper-crest-ribbon-bottom",
    ".finder-paper-crest-monogram"
  ].join(", ");
  var paperThemeRoots = [
    document.querySelector(".finder-window"),
    document.querySelector(".finder-desktop-easter-egg"),
    document.querySelector("[data-gallery-window]")
  ].filter(Boolean);
  var yeOldePhraseReplacements = [
    { pattern: /\bMacintosh HD\b/g, replacement: "The Scriptorium" },
    { pattern: /\bExplorer\b/g, replacement: "Contents" },
    { pattern: /\bFavorites\b/g, replacement: "Beloved Pages" },
    { pattern: /\bLocations\b/g, replacement: "Chapters" },
    { pattern: /\bPortfolio\b/g, replacement: "The Portfolio" },
    { pattern: /\bAbout\b/g, replacement: "About the Artist" },
    { pattern: /\bQuick start\b/g, replacement: "A Gentle Beginning" },
    { pattern: /\bRead Me\b/g, replacement: "A Kindly Preface" },
    { pattern: /\bFeatured Files\b/g, replacement: "Featured Works" },
    { pattern: /\bProject Folders\b/g, replacement: "Gathered Collections" },
    { pattern: /\bFolders\b/g, replacement: "Collections" },
    { pattern: /\bFiles\b/g, replacement: "Works" },
    { pattern: /\bBy category\b/g, replacement: "Arranged by kind" },
    { pattern: /\bPortfolio Explorer\b/g, replacement: "A Moste Gentle Chronicle of Arte, Invention, and Wonder" },
    { pattern: /\bfiles indexed\b/gi, replacement: "works gathered" },
    { pattern: /\bDouble-click energy, single-click speed\b/g, replacement: "For quiet wonder and leisurely discovery" },
    {
      pattern: /Browse projects like files on a vintage desktop\. Open any document from the explorer on the left, or start with a featured file below\./g,
      replacement: "Peruse these works as thou might wander the leaves of a beloved storybook. Begin with a highlighted work below, or follow the table of contents in the margin."
    },
    {
      pattern: /Opens files like (.+?) from the explorer\./g,
      replacement: "Herein thou mayst discover works such as $1 within these gathered leaves."
    },
    {
      pattern: /The left column acts like your file tree\. Select any project to keep the Finder shell open while loading its images and writing in the preview pane\./g,
      replacement: "The left margin gathers each work in gentle order. Choose any piece to read its tale and behold its images upon the page."
    },
    {
      pattern: /Start with (.+?), (.+?), or visit the (.+?) file for background\./g,
      replacement: "Begin, if thou wilt, with $1, $2, or turn to $3 for the tale behind the hand."
    },
    { pattern: /\bArtwork Preview\b/g, replacement: "Illumined Detail" },
    { pattern: /\bBygone Archive\b/g, replacement: "The Bygone Archive" }
  ];
  var yeOldeWordReplacements = [
    { pattern: /\byou\b/gi, replacement: "thou" },
    { pattern: /\byour\b/gi, replacement: "thy" },
    { pattern: /\byours\b/gi, replacement: "thine" },
    { pattern: /\bbefore\b/gi, replacement: "ere" },
    { pattern: /\bbetween\b/gi, replacement: "betwixt" },
    { pattern: /\bwhile\b/gi, replacement: "whilst" },
    { pattern: /\boften\b/gi, replacement: "oft" },
    { pattern: /\bsoon\b/gi, replacement: "anon" },
    { pattern: /\bperhaps\b/gi, replacement: "mayhap" },
    { pattern: /\bmaybe\b/gi, replacement: "mayhap" },
    { pattern: /\byes\b/gi, replacement: "aye" },
    { pattern: /\bno\b/gi, replacement: "nay" },
    { pattern: /\bstart\b/gi, replacement: "begin" },
    { pattern: /\bopen\b/gi, replacement: "unfurl" },
    { pattern: /\bbrowse\b/gi, replacement: "wander" },
    { pattern: /\bshow\b/gi, replacement: "shew" },
    { pattern: /\bshows\b/gi, replacement: "sheweth" },
    { pattern: /\bold\b/gi, replacement: "olden" }
    ,
    { pattern: /\bfiles\b/gi, replacement: "works" },
    { pattern: /\bfile\b/gi, replacement: "work" },
    { pattern: /\bfolders\b/gi, replacement: "collections" },
    { pattern: /\bfolder\b/gi, replacement: "collection" }
  ];
  var frakturLowercaseMap = {
    a: "𝔞",
    b: "𝔟",
    c: "𝔠",
    d: "𝔡",
    e: "𝔢",
    f: "𝔣",
    g: "𝔤",
    h: "𝔥",
    i: "𝔦",
    j: "𝔧",
    k: "𝔨",
    l: "𝔩",
    m: "𝔪",
    n: "𝔫",
    o: "𝔬",
    p: "𝔭",
    q: "𝔮",
    r: "𝔯",
    s: "𝔰",
    t: "𝔱",
    u: "𝔲",
    v: "𝔳",
    w: "𝔴",
    x: "𝔵",
    y: "𝔶",
    z: "𝔷"
  };

  function applyReplacementCase(sourceText, replacementText) {
    if (sourceText.toUpperCase() === sourceText) {
      return replacementText.toUpperCase();
    }

    if (
      sourceText.charAt(0).toUpperCase() === sourceText.charAt(0) &&
      sourceText.slice(1).toLowerCase() === sourceText.slice(1)
    ) {
      return replacementText.charAt(0).toUpperCase() + replacementText.slice(1);
    }

    return replacementText;
  }

  function toYeOldeText(value) {
    var transformedValue = value;

    yeOldePhraseReplacements.forEach(function (entry) {
      transformedValue = transformedValue.replace(entry.pattern, function (match) {
        return applyReplacementCase(match, entry.replacement);
      });
    });

    yeOldeWordReplacements.forEach(function (entry) {
      transformedValue = transformedValue.replace(entry.pattern, function (match) {
        return applyReplacementCase(match, entry.replacement);
      });
    });

    return transformedValue;
  }

  function toHeaderFrakturText(value) {
    return value.replace(/[a-z]/g, function (character) {
      return frakturLowercaseMap[character] || character;
    });
  }

  function shouldTransformPaperText(textNode) {
    if (!textNode || !textNode.textContent || !textNode.textContent.trim()) {
      return false;
    }

    var parent = textNode.parentElement;

    if (!parent) {
      return false;
    }

    if (parent.closest(".finder-neo-signature, svg")) {
      return false;
    }

    return !parent.closest("script, style, noscript, code, pre, textarea");
  }

  function isPaperHeaderTextNode(textNode) {
    var parent = textNode.parentElement;

    if (!parent) {
      return false;
    }

    return Boolean(parent.closest(paperHeaderSelector));
  }

  function updatePaperThemeText() {
    var isPaperTheme = body.getAttribute("data-theme") === "paper";

    paperThemeRoots.forEach(function (root) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      var textNodes = [];
      var currentNode = walker.nextNode();

      while (currentNode) {
        textNodes.push(currentNode);
        currentNode = walker.nextNode();
      }

      textNodes.forEach(function (textNode) {
        if (!shouldTransformPaperText(textNode)) {
          return;
        }

        if (typeof textNode.__paperOriginalText === "undefined") {
          textNode.__paperOriginalText = textNode.textContent;
        }

        if (isPaperTheme) {
          textNode.textContent = toYeOldeText(textNode.__paperOriginalText);

          if (isPaperHeaderTextNode(textNode)) {
            textNode.textContent = toHeaderFrakturText(textNode.textContent);
          }
        } else {
          textNode.textContent = textNode.__paperOriginalText;
          delete textNode.__paperOriginalText;
        }
      });
    });
  }

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

    updatePaperThemeText();

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

  if (shouldSyncTheme) {
    var savedTheme = getSavedTheme();

    if (savedTheme) {
      setTheme(savedTheme);
    }
  } else {
    document.documentElement.removeAttribute("data-theme");
    body.removeAttribute("data-theme");
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
    gallerySequence = [];
    galleryIndex = -1;
    body.classList.remove("finder-gallery-open");
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

  function getImageSource(imageElement) {
    if (!imageElement) {
      return "";
    }

    return imageElement.currentSrc || imageElement.getAttribute("src") || "";
  }

  function buildGallerySequence() {
    return Array.prototype.slice.call(clickableContentImages).filter(function (image) {
      if (!image || image.closest("[data-gallery-window]") || image.closest(".instagram-media")) {
        return false;
      }

      return Boolean(getImageSource(image));
    }).map(function (image) {
      return {
        element: image,
        src: getImageSource(image),
        title: getImageTitle(image)
      };
    });
  }

  function updateGalleryNavigation() {
    var hasMultipleImages = gallerySequence.length > 1;

    [galleryPrevControl, galleryNextControl].forEach(function (control) {
      if (!control) {
        return;
      }

      control.disabled = !hasMultipleImages;
    });
  }

  function setGalleryEntry(index) {
    if (!gallerySequence.length || !galleryImage) {
      return;
    }

    var normalizedIndex = ((index % gallerySequence.length) + gallerySequence.length) % gallerySequence.length;
    var entry = gallerySequence[normalizedIndex];
    galleryIndex = normalizedIndex;

    galleryImage.setAttribute("src", entry.src);
    galleryImage.setAttribute("alt", entry.title || "Artwork Preview");

    if (galleryTitle) {
      galleryTitle.textContent = entry.title || "Artwork Preview";

      if (galleryTitle.firstChild) {
        delete galleryTitle.firstChild.__paperOriginalText;
      }
    }

    updateGalleryNavigation();
    updatePaperThemeText();
  }

  function stepGallery(offset) {
    if (gallerySequence.length < 2) {
      return;
    }

    setGalleryEntry(galleryIndex + offset);
  }

  function openGalleryWindow(trigger, sourceImageElement) {
    if (!galleryWindow || !galleryImage || !trigger) {
      return;
    }

    var imageSrc = trigger.getAttribute("data-gallery-src");
    var imageTitle = trigger.getAttribute("data-gallery-title") || "Artwork Preview";
    gallerySequence = buildGallerySequence();
    galleryIndex = -1;

    if (sourceImageElement) {
      galleryIndex = gallerySequence.findIndex(function (entry) {
        return entry.element === sourceImageElement;
      });
    }

    if (galleryIndex === -1 && imageSrc) {
      galleryIndex = gallerySequence.findIndex(function (entry) {
        return entry.src === imageSrc;
      });
    }

    if (galleryIndex === -1 && imageSrc) {
      gallerySequence.push({
        element: null,
        src: imageSrc,
        title: imageTitle
      });
      galleryIndex = gallerySequence.length - 1;
    }

    if (!gallerySequence.length) {
      return;
    }

    setGalleryEntry(galleryIndex);
    galleryWindow.hidden = false;
    body.classList.add("finder-gallery-open");
  }

  galleryItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var itemImage = item.querySelector("img");
      openGalleryWindow(item, itemImage);
    });
  });

  clickableContentImages.forEach(function (image) {
    if (image.closest("[data-gallery-window]") || image.closest(".instagram-media") || image.closest("[data-gallery-item]")) {
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
      }, image);
    });
  });

  galleryDismissControls.forEach(function (control) {
    control.addEventListener("click", function () {
      closeGalleryWindow();
    });
  });

  if (galleryPrevControl) {
    galleryPrevControl.addEventListener("click", function () {
      stepGallery(-1);
    });
  }

  if (galleryNextControl) {
    galleryNextControl.addEventListener("click", function () {
      stepGallery(1);
    });
  }

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

  function updateDynamicText(element, value) {
    if (!element) {
      return;
    }

    element.textContent = value;

    if (element.firstChild) {
      delete element.firstChild.__paperOriginalText;
    }
  }

  function padAsciiLine(value, width, alignment) {
    var safeValue = String(value || "");

    if (safeValue.length >= width) {
      return safeValue.slice(0, width);
    }

    var remainingSpace = width - safeValue.length;
    var leftPadding = 0;
    var rightPadding = 0;

    if (alignment === "right") {
      leftPadding = remainingSpace;
    } else if (alignment === "left") {
      rightPadding = remainingSpace;
    } else {
      leftPadding = Math.floor(remainingSpace / 2);
      rightPadding = remainingSpace - leftPadding;
    }

    return Array(leftPadding + 1).join(" ") + safeValue + Array(rightPadding + 1).join(" ");
  }

  function wrapAsciiTitle(value, width) {
    var words = String(value || "").split(/\s+/).filter(Boolean);
    var lines = [];
    var currentLine = "";

    words.forEach(function (word) {
      var nextLine = currentLine ? currentLine + " " + word : word;

      if (nextLine.length <= width || !currentLine) {
        currentLine = nextLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    if (!lines.length) {
      lines.push("");
    }

    if (lines.length === 1) {
      lines.push("");
    }

    if (lines.length > 2) {
      lines = [
        lines[0],
        lines.slice(1).join(" ").slice(0, width)
      ];
    }

    return lines;
  }

  function createTarotExperience() {
    var tarotRoot = document.querySelector("[data-tarot-root]");

    if (!tarotRoot) {
      return;
    }

    var tarotArt = tarotRoot.querySelector("[data-tarot-art]");
    var tarotStatus = tarotRoot.querySelector("[data-tarot-status]");
    var tarotForm = tarotRoot.querySelector("[data-tarot-form]");
    var tarotInput = tarotRoot.querySelector("[data-tarot-input]");
    var tarotQuery = tarotRoot.querySelector("[data-tarot-query]");
    var tarotDrawButton = tarotRoot.querySelector("[data-tarot-draw]");
    var tarotPrompt = tarotRoot.querySelector("#finder-tarot-prompt");
    var tarotSpreadLabel = tarotRoot.querySelector("[data-tarot-spread-label]");
    var tarotProgressText = tarotRoot.querySelector("[data-tarot-progress-text]");
    var tarotSidebarSpreadSelect = tarotRoot.querySelector("[data-tarot-spread-select]");
    var tarotFontSelect = tarotRoot.querySelector("[data-tarot-font-select]");
    var tarotFontSizeSelect = tarotRoot.querySelector("[data-tarot-font-size-select]");
    var tarotSidebarStatus = tarotRoot.querySelector("[data-tarot-sidebar-status]");
    var tarotReadingPosition = tarotRoot.querySelector("[data-tarot-reading-position]");
    var tarotReadingCard = tarotRoot.querySelector("[data-tarot-reading-card]");
    var tarotReadingText = tarotRoot.querySelector("[data-tarot-reading-text]");
    var tarotReadingContext = tarotRoot.querySelector("[data-tarot-reading-context]");
    var deckRenderWidth = 43;
    var deckRenderHeight = 16;
    var rwsAspectWidth = 3;
    var rwsAspectHeight = 5;
    var revealedBaseCardWidth = 64;
    var revealedBaseCardHeight = 92;
    var revealedCardWidth = revealedBaseCardWidth;
    var revealedCardHeight = revealedBaseCardHeight;
    var revealedArtWidth = revealedCardWidth - 2;
    var revealedArtHeight = revealedCardHeight - 2;
    var deckShadeMap = ".,-~:;=!*#$@";
    var rwsAsciiCards = null;
    var rwsAsciiCardsPromise = null;
    var tarotTargetCardRatio = 3 / 5;
    var tarotVisualGlyphWidthBias = 0.62;
    var tarotFontStacks = {
      "terminal-gothic": "\"Terminal Gothic\", \"IBM Plex Mono\", \"Fira Mono\", \"Consolas\", \"Courier New\", monospace",
      "ink-snare": "\"Ink Snare\", \"Terminal Gothic\", \"IBM Plex Mono\", \"Consolas\", monospace",
      tenebris: "\"Tenebris\", \"Terminal Gothic\", \"IBM Plex Mono\", \"Consolas\", monospace",
      gairaigo: "\"Gairaigo\", \"Terminal Gothic\", \"IBM Plex Mono\", \"Consolas\", monospace",
      skeletext: "\"Skeletext\", \"Terminal Gothic\", \"IBM Plex Mono\", \"Consolas\", monospace",
      t64: "\"T64\", \"IBM Plex Mono\", \"Consolas\", \"Courier New\", monospace",
      "cultist-script": "\"Cultist Script\", \"IBM Plex Mono\", \"Consolas\", \"Courier New\", monospace",
      "mycelium-og": "\"Mycelium OG\", \"IBM Plex Mono\", \"Consolas\", \"Courier New\", monospace",
      "ibm-mda": "\"Web437 IBM MDA\", \"Courier New\", Courier, monospace",
      "system-mono": "\"IBM Plex Mono\", \"Fira Mono\", \"Consolas\", \"Courier New\", monospace"
    };
    var spreadDefinitions = {
      single: {
        label: "Single card",
        slots: [
          { id: "single", label: "Core revelation", purpose: "the center truth in your question" }
        ]
      },
      "three-card": {
        label: "Three-card spread",
        slots: [
          { id: "past", label: "Past", purpose: "the prior pattern shaping this moment" },
          { id: "present", label: "Present", purpose: "what is active and immediate now" },
          { id: "future", label: "Future", purpose: "the likely direction of the current path" }
        ]
      },
      "celtic-cross": {
        label: "Celtic Cross spread",
        slots: [
          { id: "heart", label: "Present Heart", purpose: "the matter at the center of this reading" },
          { id: "crossing", label: "Crossing Force", purpose: "the challenge or catalyst crossing the heart" },
          { id: "root", label: "Root", purpose: "deep foundation beneath conscious awareness" },
          { id: "recent", label: "Recent Past", purpose: "the event that has just moved through" },
          { id: "crown", label: "Crown", purpose: "the aspiration or horizon above the issue" },
          { id: "near", label: "Near Future", purpose: "the movement approaching next" },
          { id: "self", label: "Self", purpose: "your stance and role in this unfolding arc" },
          { id: "others", label: "Environment", purpose: "external influences and pressures around you" },
          { id: "hopes", label: "Hopes and Fears", purpose: "the desire and anxiety intertwined in this question" },
          { id: "outcome", label: "Outcome", purpose: "where this pattern resolves if momentum continues" }
        ]
      }
    };
    var majorArcanaNames = [
      "THE FOOL", "THE MAGICIAN", "THE HIGH PRIESTESS", "THE EMPRESS", "THE EMPEROR", "THE HIEROPHANT",
      "THE LOVERS", "THE CHARIOT", "STRENGTH", "THE HERMIT", "WHEEL OF FORTUNE", "JUSTICE",
      "THE HANGED MAN", "DEATH", "TEMPERANCE", "THE DEVIL", "THE TOWER", "THE STAR", "THE MOON",
      "THE SUN", "JUDGEMENT", "THE WORLD"
    ];
    var majorMeanings = {
      "THE FOOL": "The Fool opens an unmarked road: trust, beginnings, and a deliberate step into uncertainty with clear attention.",
      "THE MAGICIAN": "The Magician indicates focused agency. Your tools are already present; the work is disciplined alignment and execution.",
      "THE HIGH PRIESTESS": "The High Priestess asks for listening before action. Hidden information and intuition are as important as visible facts.",
      "THE EMPRESS": "The Empress points to growth, care, and creative fertility. What you nourish with consistency will multiply.",
      "THE EMPEROR": "The Emperor emphasizes structure, boundaries, and leadership. Stabilize the foundation before expanding.",
      "THE HIEROPHANT": "The Hierophant highlights tradition, teachers, and tested systems. Learn the rule before deciding how to bend it.",
      "THE LOVERS": "The Lovers concerns alignment of values. The choice is less about preference and more about integrity.",
      "THE CHARIOT": "The Chariot calls for directed momentum. Progress arrives through commitment, not scattered force.",
      "STRENGTH": "Strength is quiet command: patience, courage, and gentle control over reactive impulses.",
      "THE HERMIT": "The Hermit marks a reflective phase. Solitude and study reveal the next precise step.",
      "WHEEL OF FORTUNE": "The Wheel of Fortune signals cyclic change. Adaptability and timing matter more than rigid control.",
      "JUSTICE": "Justice concerns cause and consequence. Make the clean decision that remains true under scrutiny.",
      "THE HANGED MAN": "The Hanged Man asks for a changed perspective. A temporary pause prevents a costly repetition.",
      "DEATH": "Death marks transformation. Release what has ended so the next form can emerge without distortion.",
      "TEMPERANCE": "Temperance is integration and calibration. Moderate extremes and combine opposites into a workable rhythm.",
      "THE DEVIL": "The Devil reveals binding patterns. Naming the chain is the first act of freedom.",
      "THE TOWER": "The Tower indicates abrupt correction. A weak structure is being removed so truth can stand.",
      "THE STAR": "The Star restores trust and direction. Move forward with quiet hope and practical healing.",
      "THE MOON": "The Moon points to ambiguity, projections, and instinct. Verify assumptions while honoring subtle signals.",
      "THE SUN": "The Sun brings clarity, vitality, and confidence. Visibility increases, and truthful effort is rewarded.",
      "JUDGEMENT": "Judgement calls for honest reckoning. Integrate lessons and answer the larger calling now present.",
      "THE WORLD": "The World signifies completion and integration. One cycle closes with mastery; a new one begins on stronger ground."
    };
    var suitDefinitions = {
      CUPS: {
        symbol: "♥",
        altSymbol: "♡",
        element: "Water",
        domain: "emotions, relationships, and intuition",
        texture: ["♥♡♥♡♥", "჻♥჻♥჻", "♡♥♡♥♡", "♥◌♥◌♥"]
      },
      SWORDS: {
        symbol: "♠",
        altSymbol: "♤",
        element: "Air",
        domain: "intellect, speech, and difficult clarity",
        texture: ["♠♤♠♤♠", "╱♠╲♤╱", "♤⚚♠⚚♤", "♠⟐♠⟐♠"]
      },
      PENTACLES: {
        symbol: "♦",
        altSymbol: "♢",
        element: "Earth",
        domain: "resources, work, embodiment, and craft",
        texture: ["♦♢♦♢♦", "◈♦◈♦◈", "♢◆♢◆♢", "♦¤♦¤♦"]
      },
      WANDS: {
        symbol: "♣",
        altSymbol: "♧",
        element: "Fire",
        domain: "energy, momentum, and creative ignition",
        texture: ["♣♧♣♧♣", "☩♣☩♣☩", "♧✶♧✶♧", "♣╳♣╳♣"]
      }
    };
    var rankMeanings = {
      ACE: "A pure beginning or seed-form appears. Start with focus and protect the initial impulse.",
      TWO: "A polarity must be balanced. Decisions and partnership dynamics become central.",
      THREE: "Expansion phase. Collaboration and visible growth can accelerate outcomes.",
      FOUR: "Consolidation. Stabilize gains, create order, and respect limits.",
      FIVE: "Tension and disruption reveal what is misaligned. Conflict can become correction.",
      SIX: "Rebalancing and movement. Assistance, reciprocity, or transition supports progress.",
      SEVEN: "Testing period. Strategy, faith, and evaluation determine what holds.",
      EIGHT: "Acceleration and pattern-building. Repetition and discipline shape momentum.",
      NINE: "Maturation and culmination near completion. Guard against isolation or overcontrol.",
      TEN: "The cycle reaches full weight. Closure, inheritance, and consequence are visible.",
      PAGE: "A learner's threshold. Curiosity and messages open a fresh chapter.",
      KNIGHT: "Active pursuit. The energy is directional and asks for brave movement.",
      QUEEN: "Inner authority and stewardship. Lead through embodiment and wise boundaries.",
      KING: "Outer authority and mastery. Govern the field with responsibility and vision."
    };
    var tarotState = {
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      timerId: null,
      isCharged: false,
      isScrambling: false,
      awaitingDraw: false,
      showingDeck: true,
      currentCard: null,
      query: "",
      spreadId: "single",
      spreadSlots: spreadDefinitions.single.slots.slice(),
      drawnCards: [],
      deckPool: [],
      artWidth: deckRenderWidth,
      artHeight: deckRenderHeight
    };

    function normalizeAsciiLine(line, width) {
      var source = String(line || "");

      if (source.length > width) {
        var start = Math.floor((source.length - width) / 2);
        return source.slice(start, start + width);
      }

      return padAsciiLine(source, width, "center");
    }

    function normalizeAsciiFrame(value, width, height) {
      var lines = String(value || "").split("\n").map(function (line) {
        return normalizeAsciiLine(line, width);
      });

      if (lines.length > height) {
        var trimStart = Math.floor((lines.length - height) / 2);
        lines = lines.slice(trimStart, trimStart + height);
      }

      while (lines.length < height) {
        lines.splice(Math.floor(lines.length / 2), 0, Array(width + 1).join(" "));
      }

      return lines.join("\n");
    }

    function resampleAsciiFrame(value, targetWidth, targetHeight) {
      var rawLines = String(value || "").split("\n");
      var sourceWidth = 0;
      var sourceHeight;
      var sourceLines;
      var output = [];
      var rowIndex;
      var columnIndex;
      var sourceRow;
      var sourceColumn;
      var row = "";

      rawLines.forEach(function (line) {
        sourceWidth = Math.max(sourceWidth, String(line || "").length);
      });

      if (!sourceWidth || !rawLines.length) {
        return normalizeAsciiFrame("", targetWidth, targetHeight);
      }

      sourceHeight = rawLines.length;
      sourceLines = rawLines.map(function (line) {
        return padAsciiLine(String(line || ""), sourceWidth, "end");
      });

      if (sourceWidth === targetWidth && sourceHeight === targetHeight) {
        return sourceLines.join("\n");
      }

      for (rowIndex = 0; rowIndex < targetHeight; rowIndex += 1) {
        sourceRow = sourceHeight === 1 ? 0 : Math.round((rowIndex / (targetHeight - 1)) * (sourceHeight - 1));
        row = "";
        for (columnIndex = 0; columnIndex < targetWidth; columnIndex += 1) {
          sourceColumn = sourceWidth === 1 ? 0 : Math.round((columnIndex / (targetWidth - 1)) * (sourceWidth - 1));
          row += sourceLines[sourceRow].charAt(sourceColumn);
        }
        output.push(row);
      }

      return output.join("\n");
    }

    function updateTarotArt(value) {
      updateDynamicText(tarotArt, normalizeAsciiFrame(value, tarotState.artWidth, tarotState.artHeight));
    }

    function applyAsciiTypography() {
      var selectedFont = tarotFontSelect ? tarotFontSelect.value : "terminal-gothic";
      var selectedScale = tarotFontSizeSelect ? parseFloat(tarotFontSizeSelect.value) : 1;
      var fontStack = tarotFontStacks[selectedFont] || tarotFontStacks["terminal-gothic"];
      var scale = Number.isFinite(selectedScale) ? clamp(selectedScale, 0.7, 1.4) : 1;
      var measuredAspect = 0.5;

      tarotRoot.style.setProperty("--tarot-ascii-font", fontStack);
      tarotRoot.style.setProperty("--tarot-ascii-scale", String(scale));

      measuredAspect = measureGlyphAspectRatio();
      updateRevealGeometry(measuredAspect);

      if (tarotRoot.classList.contains("is-revealed") || tarotRoot.classList.contains("is-revealing")) {
        tarotState.artWidth = revealedCardWidth;
        tarotState.artHeight = revealedCardHeight;
        if (tarotState.currentCard) {
          resolveCardArt(tarotState.currentCard).then(function (art) {
            updateTarotArt(art);
          });
        }
      }
    }

    function measureGlyphAspectRatio() {
      var probe;
      var probeBox;
      var glyphWidth;
      var glyphHeight;

      if (!tarotArt || !document.body) {
        return 0.5;
      }

      probe = document.createElement("pre");
      probe.setAttribute("aria-hidden", "true");
      probe.textContent = "WWWWWWWWWW\nWWWWWWWWWW";
      probe.style.position = "absolute";
      probe.style.left = "-10000px";
      probe.style.top = "-10000px";
      probe.style.margin = "0";
      probe.style.padding = "0";
      probe.style.border = "0";
      probe.style.whiteSpace = "pre";
      probe.style.visibility = "hidden";
      probe.style.pointerEvents = "none";
      probe.style.fontFamily = window.getComputedStyle(tarotArt).fontFamily;
      probe.style.fontSize = window.getComputedStyle(tarotArt).fontSize;
      probe.style.lineHeight = window.getComputedStyle(tarotArt).lineHeight;
      document.body.appendChild(probe);
      probeBox = probe.getBoundingClientRect();
      document.body.removeChild(probe);

      glyphWidth = probeBox.width / 10;
      glyphHeight = probeBox.height / 2;
      if (!glyphWidth || !glyphHeight || !Number.isFinite(glyphWidth) || !Number.isFinite(glyphHeight)) {
        return 0.5;
      }

      return clamp(glyphWidth / glyphHeight, 0.2, 1.2);
    }

    function updateRevealGeometry(glyphAspect) {
      var safeAspect = Number.isFinite(glyphAspect) ? clamp(glyphAspect, 0.2, 1.2) : 0.5;
      var effectiveAspect = clamp(safeAspect * tarotVisualGlyphWidthBias, 0.16, 1.1);
      var computedWidth = Math.round((revealedBaseCardHeight * tarotTargetCardRatio) / effectiveAspect);

      revealedCardHeight = revealedBaseCardHeight;
      revealedCardWidth = clamp(computedWidth, revealedBaseCardWidth, 220);
      revealedArtWidth = revealedCardWidth - 2;
      revealedArtHeight = revealedCardHeight - 2;

      tarotRoot.style.setProperty("--tarot-reveal-display-width-ch", String(revealedCardWidth));
      tarotRoot.style.setProperty("--tarot-reveal-display-height-em", String(revealedCardHeight));
    }

    function rotatePoint(point, ax, ay, az) {
      var x = point.x;
      var y = point.y;
      var z = point.z;

      var cosX = Math.cos(ax);
      var sinX = Math.sin(ax);
      var cosY = Math.cos(ay);
      var sinY = Math.sin(ay);
      var cosZ = Math.cos(az);
      var sinZ = Math.sin(az);

      var y1 = y * cosX - z * sinX;
      var z1 = y * sinX + z * cosX;

      var x2 = x * cosY + z1 * sinY;
      var z2 = -x * sinY + z1 * cosY;

      return {
        x: x2 * cosZ - y1 * sinZ,
        y: x2 * sinZ + y1 * cosZ,
        z: z2
      };
    }

    function renderRotatingDeckFrame() {
      var width = deckRenderWidth;
      var height = deckRenderHeight;
      var framebuffer = new Array(width * height);
      var zbuffer = new Array(width * height);
      var idx;
      var layer;
      var lx = 0.45;
      var ly = 0.85;
      var lz = -0.75;
      var lightLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
      var K1 = 34;
      var K2 = 6.3;
      var halfX = 1.65;
      var halfY = 0.16;
      var halfZ = 2.4;
      var step = 0.14;
      var faces = [
        { axis: "y", value: halfY, nx: 0, ny: 1, nz: 0, u: "x", v: "z", uMin: -halfX, uMax: halfX, vMin: -halfZ, vMax: halfZ },
        { axis: "z", value: halfZ, nx: 0, ny: 0, nz: 1, u: "x", v: "y", uMin: -halfX, uMax: halfX, vMin: -halfY, vMax: halfY },
        { axis: "x", value: halfX, nx: 1, ny: 0, nz: 0, u: "z", v: "y", uMin: -halfZ, uMax: halfZ, vMin: -halfY, vMax: halfY },
        { axis: "x", value: -halfX, nx: -1, ny: 0, nz: 0, u: "z", v: "y", uMin: -halfZ, uMax: halfZ, vMin: -halfY, vMax: halfY }
      ];

      lx /= lightLen;
      ly /= lightLen;
      lz /= lightLen;

      for (idx = 0; idx < framebuffer.length; idx += 1) {
        framebuffer[idx] = " ";
        zbuffer[idx] = 0;
      }

      function setPoint(x, y, z, nx, ny, nz, edgeBoost) {
        var rotatedPoint = rotatePoint({ x: x, y: y, z: z }, tarotState.rotationX, tarotState.rotationY, tarotState.rotationZ);
        var rotatedNormal = rotatePoint({ x: nx, y: ny, z: nz }, tarotState.rotationX, tarotState.rotationY, tarotState.rotationZ);
        var depth = K2 + rotatedPoint.z;
        var luminance;
        var ooz;
        var xp;
        var yp;
        var offset;
        var shadeIndex;

        if (depth <= 0.2) {
          return;
        }

        luminance = rotatedNormal.x * lx + rotatedNormal.y * ly + rotatedNormal.z * lz;
        if (luminance <= 0) {
          return;
        }

        ooz = 1 / depth;
        xp = Math.floor(width / 2 + K1 * ooz * rotatedPoint.x);
        yp = Math.floor(height / 2 - K1 * 0.6 * ooz * rotatedPoint.y);

        if (xp < 0 || yp < 0 || xp >= width || yp >= height) {
          return;
        }

        offset = xp + width * yp;
        if (ooz <= zbuffer[offset]) {
          return;
        }

        zbuffer[offset] = ooz;
        shadeIndex = Math.floor(luminance * (deckShadeMap.length - 1));
        shadeIndex = Math.max(0, Math.min(deckShadeMap.length - 1, shadeIndex + edgeBoost));
        framebuffer[offset] = deckShadeMap.charAt(shadeIndex);
      }

      function sampleFace(face, xOffset, yOffset, zOffset) {
        var u;
        var v;
        var point;
        var isEdge;

        for (u = face.uMin; u <= face.uMax; u += step) {
          for (v = face.vMin; v <= face.vMax; v += step) {
            point = { x: 0, y: 0, z: 0 };
            point[face.axis] = face.value;
            point[face.u] = u;
            point[face.v] = v;
            point.x += xOffset;
            point.y += yOffset;
            point.z += zOffset;

            isEdge = Math.abs(u - face.uMin) < step || Math.abs(u - face.uMax) < step || Math.abs(v - face.vMin) < step || Math.abs(v - face.vMax) < step;
            setPoint(point.x, point.y, point.z, face.nx, face.ny, face.nz, isEdge ? 2 : 0);
          }
        }
      }

      for (layer = 3; layer >= 0; layer -= 1) {
        var xShift = -layer * 0.03;
        var yShift = -layer * 0.05;
        var zShift = -layer * 0.1;
        var faceIndex;

        for (faceIndex = 0; faceIndex < faces.length; faceIndex += 1) {
          sampleFace(faces[faceIndex], xShift, yShift, zShift);
        }
      }

      var lines = [];
      var row;
      for (row = 0; row < height; row += 1) {
        lines.push(framebuffer.slice(row * width, (row + 1) * width).join(""));
      }

      return lines.join("\n");
    }

    function getDeckSpeed() {
      return tarotState.isCharged ? 54 : 158;
    }

    function stepDeckAnimation() {
      if (tarotState.isScrambling || !tarotState.showingDeck) {
        return;
      }

      updateTarotArt(renderRotatingDeckFrame());
      tarotState.rotationX += tarotState.isCharged ? 0.07 : 0.03;
      tarotState.rotationY += tarotState.isCharged ? 0.12 : 0.055;
      tarotState.rotationZ += tarotState.isCharged ? 0.03 : 0.013;
      tarotState.timerId = window.setTimeout(stepDeckAnimation, getDeckSpeed());
    }

    function restartDeckAnimation() {
      window.clearTimeout(tarotState.timerId);
      tarotState.timerId = null;
      stepDeckAnimation();
    }

    function pulseDeck() {
      tarotRoot.classList.remove("is-pulsing");
      void tarotRoot.offsetWidth;
      tarotRoot.classList.add("is-pulsing");
      window.setTimeout(function () {
        tarotRoot.classList.remove("is-pulsing");
      }, 700);
    }

    function romanNumeral(number) {
      var values = [
        { n: 1000, r: "M" }, { n: 900, r: "CM" }, { n: 500, r: "D" }, { n: 400, r: "CD" },
        { n: 100, r: "C" }, { n: 90, r: "XC" }, { n: 50, r: "L" }, { n: 40, r: "XL" },
        { n: 10, r: "X" }, { n: 9, r: "IX" }, { n: 5, r: "V" }, { n: 4, r: "IV" }, { n: 1, r: "I" }
      ];
      var remaining = number;
      var output = "";

      values.forEach(function (entry) {
        while (remaining >= entry.n) {
          output += entry.r;
          remaining -= entry.n;
        }
      });

      return output;
    }

    function buildMajorArcanaCards() {
      return majorArcanaNames.map(function (name, index) {
        return {
          title: name,
          subtitle: "MAJOR ARCANA · " + romanNumeral(index),
          arcana: "major",
          majorIndex: index
        };
      });
    }

    function buildMinorArcanaCards() {
      var suits = ["WANDS", "CUPS", "SWORDS", "PENTACLES"];
      var ranks = ["ACE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "PAGE", "KNIGHT", "QUEEN", "KING"];
      var cards = [];

      suits.forEach(function (suitName) {
        ranks.forEach(function (rankName) {
          cards.push({
            title: rankName + " OF " + suitName,
            subtitle: "MINOR ARCANA · " + suitDefinitions[suitName].element.toUpperCase(),
            arcana: "minor",
            suit: suitName,
            rank: rankName
          });
        });
      });

      return cards;
    }

    function buildTarotDeck() {
      return buildMajorArcanaCards().concat(buildMinorArcanaCards());
    }

    function shuffleDeck(deck) {
      var output = deck.slice();
      var index = output.length - 1;

      while (index > 0) {
        var randomIndex = Math.floor(Math.random() * (index + 1));
        var temp = output[index];
        output[index] = output[randomIndex];
        output[randomIndex] = temp;
        index -= 1;
      }

      return output;
    }

    function spreadLabelFor(spreadId) {
      return (spreadDefinitions[spreadId] || spreadDefinitions.single).label;
    }

    function getSpreadSlots(spreadId) {
      var spread = spreadDefinitions[spreadId] || spreadDefinitions.single;

      return spread.slots.map(function (slot) {
        return {
          id: slot.id,
          label: slot.label,
          purpose: slot.purpose
        };
      });
    }

    function updateSpreadUi() {
      var spreadLabel = spreadLabelFor(tarotState.spreadId);
      var drawnCount = tarotState.drawnCards.length;
      var totalCount = tarotState.spreadSlots.length;

      updateDynamicText(tarotSpreadLabel, "Current spread: " + spreadLabel);
      updateDynamicText(tarotProgressText, "Draw progress: " + drawnCount + " / " + totalCount);

      if (tarotSidebarStatus) {
        updateDynamicText(tarotSidebarStatus, "Reading progress: " + drawnCount + " / " + totalCount + " card(s) drawn.");
      }
    }

    function setSpread(spreadId) {
      tarotState.spreadId = spreadDefinitions[spreadId] ? spreadId : "single";
      tarotState.spreadSlots = getSpreadSlots(tarotState.spreadId);

      if (tarotSidebarSpreadSelect && tarotSidebarSpreadSelect.value !== tarotState.spreadId) {
        tarotSidebarSpreadSelect.value = tarotState.spreadId;
      }

      updateSpreadUi();
    }

    function getFinderBaseUrl() {
      var scriptTag = document.querySelector("script[src*='public/js/finder.js']");
      var src;
      var marker = "/public/js/finder.js";
      var markerIndex;

      if (!scriptTag) {
        return "";
      }

      src = scriptTag.getAttribute("src") || "";
      markerIndex = src.indexOf(marker);

      if (markerIndex < 0) {
        return "";
      }

      return src.slice(0, markerIndex);
    }

    function cardLookupKey(card) {
      if (!card) {
        return "";
      }

      if (card.arcana === "major") {
        return card.title;
      }

      return (card.rank || "") + " OF " + (card.suit || "");
    }

    function loadRwsAsciiCards() {
      var dataUrl;

      if (rwsAsciiCards) {
        return Promise.resolve(rwsAsciiCards);
      }

      if (rwsAsciiCardsPromise) {
        return rwsAsciiCardsPromise;
      }

      dataUrl = getFinderBaseUrl() + "/public/data/rws-ascii-cards.json";

      rwsAsciiCardsPromise = window.fetch(dataUrl)
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Failed to load ASCII cards: " + response.status);
          }
          return response.json();
        })
        .then(function (payload) {
          rwsAsciiCards = payload || {};
          return rwsAsciiCards;
        })
        .catch(function () {
          rwsAsciiCards = null;
          return null;
        });

      return rwsAsciiCardsPromise;
    }

    function resolveCardArt(card) {
      return loadRwsAsciiCards().then(function (payload) {
        var key = cardLookupKey(card);
        if (payload && payload[key]) {
          return resampleAsciiFrame(payload[key], revealedCardWidth, revealedCardHeight);
        }

        return renderTarotCard(card);
      });
    }

    function getSuitSymbols(card) {
      var definition = suitDefinitions[card.suit];

      if (!definition) {
        return "";
      }

      return definition.symbol + " " + definition.altSymbol + " · " + definition.element.toUpperCase();
    }

    function cardHash(value) {
      return String(value || "").split("").reduce(function (total, character, index) {
        return (total + character.charCodeAt(0) * (index + 3)) % 2147483647;
      }, 0);
    }

    function createSceneRenderer(width, height, seed) {
      var chars = new Array(width * height);
      var zbuf = new Array(width * height);
      var i;
      var K1 = width * 0.79;
      var K2 = 7.2;
      var ax = 0.17 + ((seed % 37) * 0.005);
      var ay = 0.55 + ((seed % 71) * 0.0038);
      var az = 0.06 + ((seed % 19) * 0.003);
      var lx = 0.35;
      var ly = 0.8;
      var lz = -0.7;
      var llen = Math.sqrt(lx * lx + ly * ly + lz * lz);

      lx /= llen;
      ly /= llen;
      lz /= llen;

      for (i = 0; i < chars.length; i += 1) {
        chars[i] = " ";
        zbuf[i] = 0;
      }

      function plot(x, y, z, nx, ny, nz, boost) {
        var rotatedPoint = rotatePoint({ x: x, y: y, z: z }, ax, ay, az);
        var rotatedNormal = rotatePoint({ x: nx, y: ny, z: nz }, ax, ay, az);
        var depth = K2 + rotatedPoint.z;
        var lum;
        var ooz;
        var xp;
        var yp;
        var offset;
        var index;

        if (depth <= 0.1) {
          return;
        }

        lum = rotatedNormal.x * lx + rotatedNormal.y * ly + rotatedNormal.z * lz;
        if (lum <= 0) {
          return;
        }

        ooz = 1 / depth;
        xp = Math.floor(width / 2 + K1 * ooz * rotatedPoint.x);
        yp = Math.floor(height / 2 - K1 * 0.58 * ooz * rotatedPoint.y);

        if (xp < 0 || yp < 0 || xp >= width || yp >= height) {
          return;
        }

        offset = xp + yp * width;
        if (ooz <= zbuf[offset]) {
          return;
        }

        zbuf[offset] = ooz;
        index = Math.floor(lum * (deckShadeMap.length - 1)) + (boost || 0);
        index = Math.max(0, Math.min(deckShadeMap.length - 1, index));
        chars[offset] = deckShadeMap.charAt(index);
      }

      function drawSphere(cx, cy, cz, radius, boost) {
        var theta;
        var phi;
        var x;
        var y;
        var z;

        for (theta = 0; theta < Math.PI; theta += 0.22) {
          for (phi = 0; phi < Math.PI * 2; phi += 0.18) {
            x = radius * Math.sin(theta) * Math.cos(phi);
            y = radius * Math.cos(theta);
            z = radius * Math.sin(theta) * Math.sin(phi);
            plot(cx + x, cy + y, cz + z, x / radius, y / radius, z / radius, boost);
          }
        }
      }

      function drawRod(cx, cy, cz, length, radius, tiltX, tiltZ, boost) {
        var t;
        var angle;
        var x;
        var y;
        var z;
        var point;
        var normal;

        for (t = -length / 2; t <= length / 2; t += 0.12) {
          for (angle = 0; angle < Math.PI * 2; angle += 0.3) {
            x = radius * Math.cos(angle);
            z = radius * Math.sin(angle);
            y = t;
            point = rotatePoint({ x: x, y: y, z: z }, tiltX || 0, 0, tiltZ || 0);
            normal = rotatePoint({ x: x / radius, y: 0, z: z / radius }, tiltX || 0, 0, tiltZ || 0);
            plot(cx + point.x, cy + point.y, cz + point.z, normal.x, normal.y, normal.z, boost);
          }
        }
      }

      function drawDisk(cx, cy, cz, radius, boost) {
        var r;
        var angle;
        var x;
        var z;

        for (r = 0; r <= radius; r += 0.08) {
          for (angle = 0; angle < Math.PI * 2; angle += 0.2) {
            x = r * Math.cos(angle);
            z = r * Math.sin(angle);
            plot(cx + x, cy, cz + z, 0, 1, 0, boost);
          }
        }
      }

      function drawStarField(amount) {
        var index;
        for (index = 0; index < amount; index += 1) {
          var px = (seed * (index + 3) % 1900) / 1900 * width;
          var py = (seed * (index + 7) % 1300) / 1300 * (height * 0.42);
          var offset = Math.floor(px) + Math.floor(py) * width;
          if (offset >= 0 && offset < chars.length && chars[offset] === " ") {
            chars[offset] = index % 2 ? "." : "*";
          }
        }
      }

      function toLines() {
        var lines = [];
        var row;
        for (row = 0; row < height; row += 1) {
          lines.push(chars.slice(row * width, (row + 1) * width).join(""));
        }
        return lines;
      }

      return {
        drawSphere: drawSphere,
        drawRod: drawRod,
        drawDisk: drawDisk,
        drawStarField: drawStarField,
        toLines: toLines
      };
    }

    function drawSuitPrimitive(scene, suit, x, y, z, scale, boost) {
      if (suit === "WANDS") {
        scene.drawRod(x, y, z, 1.4 * scale, 0.08 * scale, 0.35, 0.2, boost);
      } else if (suit === "SWORDS") {
        scene.drawRod(x, y, z, 1.6 * scale, 0.06 * scale, -0.55, 0.14, boost + 1);
      } else if (suit === "PENTACLES") {
        scene.drawDisk(x, y, z, 0.34 * scale, boost + 1);
        scene.drawSphere(x, y + 0.04 * scale, z, 0.12 * scale, boost);
      } else {
        scene.drawSphere(x - 0.15 * scale, y, z, 0.18 * scale, boost);
        scene.drawSphere(x + 0.15 * scale, y, z, 0.18 * scale, boost);
        scene.drawRod(x, y - 0.08 * scale, z, 0.5 * scale, 0.04 * scale, 0.8, 0, boost);
      }
    }

    function downsampleAsciiLines(sourceLines, targetWidth, targetHeight) {
      var sourceHeight = sourceLines.length;
      var sourceWidth = sourceLines[0] ? sourceLines[0].length : 0;
      var yScale = sourceHeight / targetHeight;
      var xScale = sourceWidth / targetWidth;
      var result = [];
      var y;
      var brightnessByChar = {};
      var idx;

      for (idx = 0; idx < deckShadeMap.length; idx += 1) {
        brightnessByChar[deckShadeMap.charAt(idx)] = idx;
      }

      for (y = 0; y < targetHeight; y += 1) {
        var x;
        var row = "";
        var yStart = Math.floor(y * yScale);
        var yEnd = Math.max(yStart + 1, Math.floor((y + 1) * yScale));

        for (x = 0; x < targetWidth; x += 1) {
          var xStart = Math.floor(x * xScale);
          var xEnd = Math.max(xStart + 1, Math.floor((x + 1) * xScale));
          var bestIndex = -1;
          var sy;

          for (sy = yStart; sy < yEnd; sy += 1) {
            var sx;
            for (sx = xStart; sx < xEnd; sx += 1) {
              var line = sourceLines[sy] || "";
              var ch = line.charAt(sx) || " ";
              var bright = typeof brightnessByChar[ch] === "number" ? brightnessByChar[ch] : -1;
              if (bright > bestIndex) {
                bestIndex = bright;
              }
            }
          }

          row += bestIndex >= 0 ? deckShadeMap.charAt(bestIndex) : " ";
        }

        result.push(row);
      }

      return result;
    }

    function renderRiderWaiteScene(card) {
      var hiWidth = revealedArtWidth * 4;
      var hiHeight = revealedArtHeight * 4;
      var scene = createSceneRenderer(hiWidth, hiHeight, cardHash(card.title));
      var pipCountByRank = {
        ACE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
        SIX: 6, SEVEN: 7, EIGHT: 8, NINE: 9, TEN: 10
      };
      var pipCount = pipCountByRank[card.rank] || 0;
      var grid;
      var i;

      scene.drawStarField(card.arcana === "major" ? 52 : 20);
      scene.drawDisk(0, -1.55, 1.1, 3.3, -2);

      if (card.arcana === "major") {
        if (card.title === "THE FOOL") {
          scene.drawSphere(-1.0, 0.15, 0.2, 0.46, 1);
          scene.drawSphere(1.35, 0.22, 0.75, 0.28, 0);
          scene.drawRod(-0.22, 0.05, 0.1, 1.35, 0.08, -0.9, 0.2, 1);
        } else if (card.title === "THE MAGICIAN") {
          scene.drawSphere(0, 0.35, 0.2, 0.4, 2);
          scene.drawRod(-1.15, -0.1, 0.45, 1.5, 0.07, 0, 0.4, 2);
          scene.drawRod(1.15, -0.1, 0.45, 1.5, 0.07, 0, -0.4, 2);
          scene.drawDisk(0, -0.8, 0.65, 0.92, 1);
        } else if (card.title === "THE HIGH PRIESTESS") {
          scene.drawSphere(0, 0.3, 0.2, 0.38, 2);
          scene.drawRod(-1.1, -0.2, 0.22, 2.0, 0.08, 0, 0, 1);
          scene.drawRod(1.1, -0.2, 0.22, 2.0, 0.08, 0, 0, 1);
        } else if (card.title === "THE EMPRESS") {
          scene.drawSphere(0, 0.36, 0.2, 0.43, 2);
          scene.drawDisk(1.5, -0.42, 0.7, 0.45, 2);
        } else if (card.title === "THE EMPEROR") {
          scene.drawSphere(0, 0.34, 0.2, 0.42, 2);
          scene.drawRod(-1.25, -0.25, 0.45, 1.45, 0.1, 0, 0.7, 1);
          scene.drawRod(1.25, -0.25, 0.45, 1.45, 0.1, 0, -0.7, 1);
        } else if (card.title === "THE HIEROPHANT") {
          scene.drawSphere(0, 0.38, 0.2, 0.4, 2);
          scene.drawRod(0, -0.3, 0.35, 2.05, 0.08, 0, 0, 2);
          scene.drawSphere(-1.35, -0.55, 0.8, 0.2, 1);
          scene.drawSphere(1.35, -0.55, 0.8, 0.2, 1);
        } else if (card.title === "THE LOVERS") {
          scene.drawSphere(-0.95, 0.12, 0.38, 0.34, 1);
          scene.drawSphere(0.95, 0.12, 0.38, 0.34, 1);
          scene.drawSphere(0, 0.98, -0.35, 0.26, 2);
        } else if (card.title === "THE CHARIOT") {
          scene.drawDisk(0, -0.25, 0.5, 1.4, 1);
          scene.drawSphere(-1.25, -0.35, 0.2, 0.24, 2);
          scene.drawSphere(1.25, -0.35, 0.2, 0.24, 2);
          scene.drawSphere(0, 0.55, 0.15, 0.3, 1);
        } else if (card.title === "STRENGTH") {
          scene.drawSphere(-0.45, 0.2, 0.3, 0.34, 1);
          scene.drawSphere(0.9, -0.1, 0.65, 0.62, 2);
        } else if (card.title === "THE HERMIT") {
          scene.drawSphere(0, 0.2, 0.2, 0.34, 1);
          scene.drawSphere(0.9, 1.05, -0.45, 0.17, 2);
          scene.drawRod(0.72, 0.0, 0.1, 1.8, 0.06, 0.2, 0.3, 1);
        } else if (card.title === "WHEEL OF FORTUNE") {
          scene.drawDisk(0, 0.1, 0.2, 1.28, 2);
          scene.drawSphere(0, 0.1, 0.2, 0.17, 2);
        } else if (card.title === "JUSTICE") {
          scene.drawSphere(0, 0.42, 0.2, 0.34, 2);
          scene.drawRod(-1.15, 0.12, 0.4, 1.6, 0.06, -0.8, 0, 1);
          scene.drawRod(1.15, 0.12, 0.4, 1.6, 0.06, 0.8, 0, 1);
          scene.drawRod(0.95, 0.16, 0.3, 1.8, 0.05, 0.2, 0, 2);
        } else if (card.title === "THE HANGED MAN") {
          scene.drawRod(0, 1.0, -0.2, 2.4, 0.07, 1.45, 0, 1);
          scene.drawSphere(0, -0.2, 0.6, 0.31, 1);
        } else if (card.title === "DEATH") {
          scene.drawSphere(-0.35, 0.38, 0.2, 0.34, 2);
          scene.drawRod(1.0, -0.05, 0.3, 2.0, 0.08, -0.4, 0.25, 2);
        } else if (card.title === "TEMPERANCE") {
          scene.drawSphere(0, 0.34, 0.2, 0.37, 2);
          scene.drawDisk(-0.85, -0.22, 0.2, 0.35, 1);
          scene.drawDisk(0.85, 0.02, 0.4, 0.35, 1);
        } else if (card.title === "THE DEVIL") {
          scene.drawSphere(0, 0.42, 0.1, 0.42, 2);
          scene.drawSphere(-1.0, -0.35, 0.5, 0.24, 1);
          scene.drawSphere(1.0, -0.35, 0.5, 0.24, 1);
          scene.drawRod(0, -0.25, 0.25, 1.7, 0.05, 0, 0, 2);
        } else if (card.title === "THE TOWER") {
          scene.drawRod(0.2, 0.2, 0.2, 2.8, 0.21, 0, 0.08, 2);
          scene.drawSphere(-1.25, 1.05, -0.55, 0.26, 2);
        } else if (card.title === "THE STAR") {
          scene.drawSphere(0, 0.95, -0.75, 0.32, 2);
          scene.drawSphere(0, 0.02, 0.25, 0.3, 1);
          scene.drawDisk(1.2, -0.7, 0.7, 0.65, 1);
        } else if (card.title === "THE MOON") {
          scene.drawDisk(0, 1.08, -0.85, 0.48, 2);
          scene.drawSphere(-1.3, -0.35, 0.4, 0.25, 1);
          scene.drawSphere(1.3, -0.35, 0.4, 0.25, 1);
        } else if (card.title === "THE SUN") {
          scene.drawSphere(0, 1.12, -0.8, 0.45, 2);
          scene.drawSphere(0, -0.04, 0.3, 0.3, 1);
        } else if (card.title === "JUDGEMENT") {
          scene.drawRod(0, 0.9, -0.5, 2.2, 0.06, 0, 0.5, 2);
          scene.drawSphere(0, 1.15, -0.82, 0.24, 2);
          scene.drawSphere(-0.8, -0.68, 0.3, 0.22, 1);
          scene.drawSphere(0.8, -0.68, 0.3, 0.22, 1);
        } else if (card.title === "THE WORLD") {
          scene.drawDisk(0, 0.02, 0.2, 1.35, 2);
          scene.drawSphere(0, 0.02, 0.2, 0.3, 1);
          scene.drawSphere(-1.5, 0.95, -0.65, 0.2, 1);
          scene.drawSphere(1.5, 0.95, -0.65, 0.2, 1);
          scene.drawSphere(-1.5, -0.75, -0.65, 0.2, 1);
          scene.drawSphere(1.5, -0.75, -0.65, 0.2, 1);
        } else {
          scene.drawSphere(0, 0.45, 0.25, 0.45, 2);
          scene.drawRod(0, -0.1, 0.3, 1.6, 0.07, 0, 0, 1);
        }
      } else {
        if (pipCount > 0) {
          grid = [];
          if (pipCount <= 2) {
            grid = [[-0.95, 0.42], [0.95, -0.28]];
          } else if (pipCount <= 4) {
            grid = [[-1.2, 0.58], [1.2, 0.58], [-1.2, -0.35], [1.2, -0.35]];
          } else if (pipCount <= 6) {
            grid = [[-1.25, 0.7], [0, 0.7], [1.25, 0.7], [-1.25, -0.32], [0, -0.32], [1.25, -0.32]];
          } else {
            grid = [[-1.45, 0.82], [-0.45, 0.82], [0.45, 0.82], [1.45, 0.82], [-1.45, -0.15], [-0.45, -0.15], [0.45, -0.15], [1.45, -0.15], [0, 0.34], [0, -0.72]];
          }

          for (i = 0; i < pipCount; i += 1) {
            drawSuitPrimitive(scene, card.suit, grid[i][0], grid[i][1], 0.25 + (i % 2) * 0.12, 1, 1);
          }
        } else {
          scene.drawSphere(0, 0.4, 0.22, 0.36, 2);
          if (card.rank === "KNIGHT") {
            scene.drawSphere(1.0, -0.05, 0.45, 0.32, 1);
            drawSuitPrimitive(scene, card.suit, -0.6, -0.06, 0.2, 1.6, 2);
            scene.drawRod(0.2, -0.6, 0.8, 1.9, 0.06, 0, 0.22, 1);
          } else if (card.rank === "QUEEN") {
            scene.drawDisk(0.9, -0.25, 0.42, 0.55, 1);
            drawSuitPrimitive(scene, card.suit, -0.5, -0.1, 0.2, 1.4, 2);
            scene.drawSphere(1.35, -0.62, 0.95, 0.2, 1);
          } else if (card.rank === "KING") {
            scene.drawRod(0.95, 0.02, 0.2, 2.05, 0.09, 0, 0.2, 2);
            drawSuitPrimitive(scene, card.suit, -0.8, -0.02, 0.2, 1.6, 2);
            scene.drawDisk(1.5, -0.75, 1.05, 0.35, 1);
          } else {
            drawSuitPrimitive(scene, card.suit, -0.9, -0.05, 0.2, 1.3, 2);
            scene.drawSphere(0.85, -0.45, 0.75, 0.22, 1);
          }
        }
      }

      return downsampleAsciiLines(scene.toLines(), revealedArtWidth, revealedArtHeight);
    }

    function renderTarotCard(card) {
      var scene = renderRiderWaiteScene(card);
      var cardInnerWidth = revealedCardWidth - 2;
      var border = Array(cardInnerWidth + 1).join("─");
      var output = ["┌" + border + "┐"];
      var rowIndex;

      for (rowIndex = 0; rowIndex < revealedCardHeight - 2; rowIndex += 1) {
        output.push("│" + normalizeAsciiLine(scene[rowIndex] || "", cardInnerWidth) + "│");
      }

      output.push("└" + border + "┘");
      return output.join("\n");
    }

    function createScrambleFrame(seedText) {
      var characterPool = ".,-~:;=!*#$@\\/|_+{}[]()<>?%";
      var lines = [];
      var rowIndex;
      var columnIndex;
      var row;

      for (rowIndex = 0; rowIndex < tarotState.artHeight; rowIndex += 1) {
        row = "";
        for (columnIndex = 0; columnIndex < tarotState.artWidth; columnIndex += 1) {
          row += characterPool.charAt(Math.floor(Math.random() * characterPool.length));
        }
        lines.push(row);
      }

      if (seedText) {
        lines[Math.floor(tarotState.artHeight / 2)] = padAsciiLine(seedText.slice(0, tarotState.artWidth), tarotState.artWidth, "center");
      }

      return lines.join("\n");
    }

    function getCardMeaning(card) {
      if (card.arcana === "major") {
        return majorMeanings[card.title] || "This major card marks an inflection point requiring deliberate attention.";
      }

      var suitMeta = suitDefinitions[card.suit];
      var rankMeaning = rankMeanings[card.rank] || "A meaningful shift is active in this card.";

      return card.title + " channels " + suitMeta.element.toLowerCase() + " through " + suitMeta.domain + ". " + rankMeaning;
    }

    function getCardContext(card, query, slot) {
      var slotContext = slot ? "In the " + slot.label + " position (" + slot.purpose + "), " : "";

      if (card.arcana === "major") {
        return slotContext + "your question \"" + query + "\" touches a major turning point. Treat this as an archetypal signal, not a small mood fluctuation.";
      }

      return slotContext + "for \"" + query + "\", this card grounds the reading in " + suitDefinitions[card.suit].domain + ".";
    }

    function updateReadingPanel(card, slot, drawIndex, totalDraws) {
      updateDynamicText(tarotReadingPosition, "Position " + drawIndex + " of " + totalDraws + ": " + slot.label + ".");
      updateDynamicText(tarotReadingCard, "Card: " + card.title);
      updateDynamicText(tarotReadingText, getCardMeaning(card));
      updateDynamicText(tarotReadingContext, getCardContext(card, tarotState.query, slot));
    }

    function resetReadingPanel() {
      updateDynamicText(tarotReadingPosition, "Status: waiting for your first draw.");
      updateDynamicText(tarotReadingCard, "Card: no card drawn yet.");
      updateDynamicText(tarotReadingText, "Submit a focused question and click the deck to reveal cards in your chosen spread.");
      updateDynamicText(tarotReadingContext, "The draw context appears here after the card is revealed.");
    }

    function startSession(queryValue) {
      tarotState.query = queryValue;
      tarotState.deckPool = shuffleDeck(buildTarotDeck());
      tarotState.currentCard = null;
      tarotState.drawnCards = [];
      tarotState.awaitingDraw = true;
      tarotState.isCharged = true;
      tarotState.isScrambling = false;
      tarotState.showingDeck = true;
      tarotState.artWidth = deckRenderWidth;
      tarotState.artHeight = deckRenderHeight;

      tarotRoot.classList.add("is-awake");
      tarotRoot.classList.add("is-submitted");
      tarotRoot.classList.remove("is-revealed");
      tarotDrawButton.classList.add("is-ready");
      tarotDrawButton.setAttribute("aria-label", "Draw card 1 of " + tarotState.spreadSlots.length);
      updateDynamicText(tarotStatus, "Submitted. The deck pulses faster now. Click to draw " + tarotState.spreadSlots.length + " card(s).");
      updateDynamicText(tarotPrompt, "Position 1: " + tarotState.spreadSlots[0].label + ".");
      updateDynamicText(tarotQuery, '"' + queryValue + '"');
      tarotQuery.hidden = false;
      resetReadingPanel();
      updateSpreadUi();
      pulseDeck();
      restartDeckAnimation();
      loadRwsAsciiCards();
    }

    function finishSession(statusMessage, promptMessage) {
      tarotState.awaitingDraw = false;
      tarotState.isCharged = false;
      tarotState.showingDeck = false;
      tarotRoot.classList.remove("is-awake");
      tarotRoot.classList.add("is-revealed");
      tarotDrawButton.classList.remove("is-ready");
      tarotDrawButton.setAttribute("aria-label", "Reading complete");
      updateDynamicText(tarotPrompt, promptMessage || "Card drawn. Submit another query to draw again.");
      updateDynamicText(tarotStatus, statusMessage || "Reading complete.");
    }

    function revealCard() {
      var selectedCard = tarotState.deckPool.pop();
      var slotIndex = tarotState.drawnCards.length;
      var slot = tarotState.spreadSlots[slotIndex];
      var totalDraws = tarotState.spreadSlots.length;
      var scrambleSteps = 14;
      var currentStep = 0;

      if (!selectedCard) {
        tarotState.deckPool = shuffleDeck(buildTarotDeck());
        selectedCard = tarotState.deckPool.pop();
      }

      if (!selectedCard) {
        finishSession("Deck error: please submit again.", "Submit a query to reset the deck.");
        return;
      }

      if (!slot) {
        finishSession("Spread complete.", "Submit again for another reading.");
        return;
      }

      tarotState.isScrambling = true;
      tarotState.currentCard = selectedCard;
      tarotState.artWidth = deckRenderWidth;
      tarotState.artHeight = deckRenderHeight;
      tarotRoot.classList.remove("is-pulsing");
      tarotRoot.classList.add("is-revealing");
      window.clearTimeout(tarotState.timerId);
      updateDynamicText(tarotStatus, "Drawing card " + (slotIndex + 1) + " of " + totalDraws + "...");

      function runScrambleStep() {
        if (currentStep >= scrambleSteps) {
          var remaining;
          tarotState.isScrambling = false;
          tarotState.drawnCards.push({
            slot: slot,
            card: selectedCard
          });
          tarotState.artWidth = revealedCardWidth;
          tarotState.artHeight = revealedCardHeight;
          updateDynamicText(tarotStatus, "Rendering " + selectedCard.title + "...");
          resolveCardArt(selectedCard).then(function (art) {
            updateTarotArt(art);
            tarotRoot.classList.remove("is-revealing");
            tarotRoot.classList.add("is-revealed");
            updateReadingPanel(selectedCard, slot, slotIndex + 1, totalDraws);
            updateSpreadUi();
            remaining = totalDraws - tarotState.drawnCards.length;

            if (remaining > 0) {
              tarotState.awaitingDraw = true;
              tarotState.isCharged = true;
              tarotState.showingDeck = true;
              tarotState.artWidth = deckRenderWidth;
              tarotState.artHeight = deckRenderHeight;
              tarotRoot.classList.add("is-awake");
              tarotDrawButton.classList.add("is-ready");
              tarotDrawButton.setAttribute("aria-label", "Draw card " + (slotIndex + 2) + " of " + totalDraws);
              updateDynamicText(tarotStatus, selectedCard.title + " revealed. " + remaining + " card(s) remaining.");
              updateDynamicText(tarotPrompt, "Position " + (slotIndex + 2) + ": " + tarotState.spreadSlots[slotIndex + 1].label + ".");
              restartDeckAnimation();
            } else {
              finishSession(selectedCard.title + " revealed. Spread complete.", "The spread has answered.");
            }
          });
          return;
        }

        updateTarotArt(createScrambleFrame(""));
        currentStep += 1;
        window.setTimeout(runScrambleStep, 36 + currentStep * 6);
      }

      runScrambleStep();
    }

    if (tarotForm) {
      tarotForm.addEventListener("submit", function (event) {
        var queryValue;

        event.preventDefault();

        if (!tarotInput) {
          return;
        }

        queryValue = tarotInput.value.trim();

        if (!queryValue) {
          updateDynamicText(tarotStatus, "The deck waits for a question before it can awaken.");
          updateDynamicText(tarotPrompt, "Enter a query to begin.");
          tarotInput.focus();
          return;
        }

        startSession(queryValue);
      });
    }

    if (tarotSidebarSpreadSelect) {
      tarotSidebarSpreadSelect.addEventListener("change", function () {
        var selectedSpread = tarotSidebarSpreadSelect.value;
        setSpread(selectedSpread);
        tarotState.awaitingDraw = false;
        tarotState.isCharged = false;
        tarotState.showingDeck = true;
        tarotState.artWidth = deckRenderWidth;
        tarotState.artHeight = deckRenderHeight;
        tarotState.drawnCards = [];
        tarotRoot.classList.remove("is-awake", "is-revealed");
        tarotDrawButton.classList.remove("is-ready");
        updateDynamicText(tarotStatus, "Spread changed to " + spreadLabelFor(tarotState.spreadId) + ". Submit your query to begin.");
        updateDynamicText(tarotPrompt, "Enter a query, submit, then click the deck.");
        resetReadingPanel();
        updateTarotArt(renderRotatingDeckFrame());
        restartDeckAnimation();
      });
    }

    if (tarotFontSelect) {
      tarotFontSelect.addEventListener("change", applyAsciiTypography);
    }

    if (tarotFontSizeSelect) {
      tarotFontSizeSelect.addEventListener("change", applyAsciiTypography);
    }

    if (tarotDrawButton) {
      tarotDrawButton.addEventListener("click", function () {
        if (tarotState.isScrambling) {
          return;
        }

        if (!tarotState.awaitingDraw) {
          updateDynamicText(tarotStatus, "Submit a query first, then click the deck to draw.");
          updateDynamicText(tarotPrompt, "The deck is not charged yet.");
          if (tarotInput) {
            tarotInput.focus();
          }
          return;
        }

        tarotState.awaitingDraw = false;
        tarotState.isCharged = false;
        tarotRoot.classList.remove("is-awake");
        tarotDrawButton.classList.remove("is-ready");
        revealCard();
      });
    }

    setSpread(tarotSidebarSpreadSelect ? tarotSidebarSpreadSelect.value : "single");
    applyAsciiTypography();
    tarotState.deckPool = shuffleDeck(buildTarotDeck());
    updateTarotArt(renderRotatingDeckFrame());
    resetReadingPanel();
    updateSpreadUi();
    restartDeckAnimation();

  }

  createTarotExperience();

  window.addEventListener("resize", function () {
    if (window.innerWidth > 960) {
      setSidebarState(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeGalleryWindow();
      return;
    }

    if (!galleryWindow || galleryWindow.hidden) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepGallery(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      stepGallery(1);
    }
  });
});
