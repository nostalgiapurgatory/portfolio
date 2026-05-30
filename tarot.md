---
layout: tarot
title: Tarot
permalink: /tarot/
---

<section class="finder-tarot-experience tarot-standalone-experience" data-tarot-root>
  <div class="tarot-standalone-shell">
    <aside class="tarot-reading-sidebar" aria-label="Tarot controls">
      <p class="finder-pane-eyebrow">Divination Terminal</p>
      <div class="finder-tarot-controls-panel">
        <label class="finder-tarot-sidebar-label" for="finder-tarot-spread-select">Choose spread</label>
        <select class="finder-tarot-sidebar-select" id="finder-tarot-spread-select" data-tarot-spread-select>
          <option value="single">Single card</option>
          <option value="three-card">Three-card spread</option>
          <option value="celtic-cross">Celtic Cross spread</option>
        </select>
        <label class="finder-tarot-sidebar-label" for="finder-tarot-font-select">ASCII font</label>
        <select class="finder-tarot-sidebar-select" id="finder-tarot-font-select" data-tarot-font-select>
          <option value="terminal-gothic">Terminal Gothic</option>
          <option value="ink-snare">Ink Snare</option>
          <option value="tenebris">Tenebris</option>
          <option value="gairaigo">Gairaigo</option>
          <option value="skeletext">Skeletext</option>
          <option value="t64">T64</option>
          <option value="cultist-script">Cultist Script</option>
          <option value="mycelium-og">Mycelium OG</option>
          <option value="ibm-mda">Web437 IBM MDA</option>
          <option value="system-mono">System monospace</option>
        </select>
        <label class="finder-tarot-sidebar-label" for="finder-tarot-font-size-select">ASCII size</label>
        <select class="finder-tarot-sidebar-select" id="finder-tarot-font-size-select" data-tarot-font-size-select>
          <option value="0.75">0.75x</option>
          <option value="0.9">0.9x</option>
          <option value="1" selected>1x</option>
          <option value="1.15">1.15x</option>
          <option value="1.3">1.3x</option>
        </select>
        <p class="finder-tarot-sidebar-status" data-tarot-sidebar-status>Ready for a new reading.</p>
      </div>
    </aside>

    <section class="finder-tarot-stage" aria-labelledby="finder-tarot-prompt">
      <header class="finder-tarot-header">
        <div>
          <h1 class="finder-tarot-sr-title">Oracle Card</h1>
          <pre class="finder-tarot-title" aria-hidden="true">
  ___   ____      _    ____ _     _____    ____    _    ____  ____
 / _ \ |  _ \    / \  / ___| |   | ____|  / ___|  / \  |  _ \|  _ \
| | | || |_) |  / _ \| |   | |   |  _|   | |     / _ \ | |_) | | | |
| |_| ||  _ <  / ___ \ |___| |___| |___  | |___ / ___ \|  _ <| |_| |
 \___/ |_| \_\/_/   \_\____|_____|_____|  \____/_/   \_\_| \_\____/
          </pre>
        </div>
      </header>

      <form class="finder-tarot-form" data-tarot-form>
        <label class="finder-tarot-label" for="finder-tarot-query">Your query</label>
        <div class="finder-tarot-form-row">
          <input
            class="finder-tarot-input"
            id="finder-tarot-query"
            name="query"
            type="text"
            maxlength="160"
            autocomplete="off"
            spellcheck="false"
            placeholder="What should the cards reveal?"
            data-tarot-input
          >
          <button class="finder-tarot-submit" type="submit">Submit</button>
        </div>
      </form>

      <p class="finder-tarot-stage-label" id="finder-tarot-prompt">Enter a query, submit, then click the deck.</p>
      <p class="finder-tarot-spread-label" data-tarot-spread-label>Current spread: Single card</p>
      <p class="finder-tarot-progress-label" data-tarot-progress-text>Draw progress: 0 / 1</p>

      <div class="finder-tarot-viewport">
        <button class="finder-tarot-deck-button" type="button" data-tarot-draw aria-describedby="finder-tarot-status">
          <pre class="finder-tarot-art" data-tarot-art aria-live="polite"></pre>
        </button>
      </div>

      <p class="finder-tarot-status" id="finder-tarot-status" data-tarot-status>
        The deck waits in silence.
      </p>

      <p class="finder-tarot-query" data-tarot-query hidden></p>

      <section class="finder-tarot-reading" data-tarot-reading>
        <h2 class="finder-tarot-reading-title">Card interpretation</h2>
        <p class="finder-tarot-reading-position" data-tarot-reading-position>
          Status: waiting for your first draw.
        </p>
        <p class="finder-tarot-reading-card" data-tarot-reading-card>
          Card: no card drawn yet.
        </p>
        <p class="finder-tarot-reading-text" data-tarot-reading-text>
          Submit a focused question and click the rotating deck to reveal cards in your chosen spread.
        </p>
        <p class="finder-tarot-reading-context" data-tarot-reading-context>
          The draw context appears here after the card is revealed.
        </p>
      </section>
    </section>
  </div>
</section>

<!--
Inspiration reference: https://littlebitspace.com/
Resources reference: https://littlebitspace.com/resources/
Typeface and retro-ASCII interaction inspiration by littlebitspace.
-->
