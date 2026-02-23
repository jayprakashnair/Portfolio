/* ================================================================
   SHELL.JS — Injects shared chrome into every page
   IMPORTANT: Loaded first, so must NOT call main.js functions directly.
   All onclick handlers use string form so they resolve at call-time.
================================================================ */

(function () {
    // ── Detect subdirectory depth so links always work ──
    const inPages = window.location.pathname.includes('/pages/');
    const root    = inPages ? '../' : '';

    // ── Background layers ──
    ['background-layer', 'background-grid', 'overlay-layer'].forEach(cls => {
        const d = document.createElement('div');
        d.className = cls;
        document.body.prepend(d);
    });

    // ── Top Nav ──
    const nav = document.createElement('nav');
    nav.className = 'top-nav';
    nav.innerHTML = `
        <div class="nav-left">
            <a href="${root}index.html" class="nav-logo"><i class="fas fa-dna"></i> JP NAIR</a>
        </div>
        <div class="nav-menu" id="navMenu"></div>
        <div class="nav-controls">
            <a href="mailto:jsnair.hi@gmail.com" title="Contact Me"
               style="border-color:var(--accent);color:var(--accent);">
                <i class="fas fa-envelope"></i>
            </a>
            <div class="control-btn" title="Accent Color">
                <i class="fas fa-palette"></i>
                <input type="color" class="color-input" id="colorPicker" value="#00f2ff"
                       oninput="changeAccentColor(this.value)">
            </div>
            <button class="control-btn" onclick="toggleTheme()" title="Toggle Theme">
                <i class="fas fa-moon" id="themeIcon"></i>
            </button>
            <div class="mobile-menu-btn" onclick="toggleMobileMenu()">
                <i class="fas fa-bars"></i>
            </div>
        </div>`;
    document.body.prepend(nav);

    // ── Global flying-drones canvas ──
    const gc = document.createElement('canvas');
    gc.id = 'globalCanvas';
    document.body.appendChild(gc);

    // ── Scroll robot ──
    document.body.insertAdjacentHTML('beforeend', `
        <div class="scroll-tracker" id="scrollTracker">
            <div class="scroll-progress-fill" id="scrollFill"></div>
            <div class="scroll-robot"          id="scrollRobot"><i class="fas fa-robot"></i></div>
        </div>`);

    // ── Modal overlay (onclick wired in main.js DOMContentLoaded) ──
    document.body.insertAdjacentHTML('beforeend',
        `<div class="modal-overlay" id="overlay"></div>`);

    // ── Search bubble + button ──
    document.body.insertAdjacentHTML('beforeend', `
        <div class="search-bubble" id="searchBubble">Search Here!</div>
        <div class="search-widget-btn" onclick="toggleSearch()"><i class="fas fa-terminal"></i></div>`);

    // ── Terminal search modal ──
    document.body.insertAdjacentHTML('beforeend', `
        <div class="terminal-modal" id="terminalModal">
            <div class="terminal-header">
                <div class="terminal-dot red"    onclick="toggleSearch()"></div>
                <div class="terminal-dot yellow"></div>
                <div class="terminal-dot green"></div>
                <span class="terminal-title">visitor@jp-portfolio: ~/search</span>
            </div>
            <div class="terminal-body" id="terminalOutput">
                <div class="terminal-line" style="opacity:1;">
                    <span class="output-text">
                        Welcome! Type <span style="color:var(--accent)">'help'</span> for commands,
                        or any keyword to search this page.
                    </span>
                </div>
            </div>
            <div class="terminal-input-line">
                <span class="cmd-prompt">visitor:~$</span>
                <input type="text" class="terminal-input" id="cmdInput"
                       autocomplete="off" spellcheck="false"
                       placeholder="e.g. 'skills', 'github', 'help'...">
            </div>
        </div>`);
})();
