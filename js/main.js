/* ================================================================
   MAIN.JS — Theme, Nav, Terminal Search, Scroll Robot, Carousel
================================================================ */

// ── Page map: keyword → file path ──────────────────────────────
// Works from both root AND /pages/ because we detect depth at runtime.
function resolvePagePath(filename) {
    const inPages = window.location.pathname.includes('/pages/');
    if (filename.startsWith('http')) return filename;
    if (inPages) {
        // from /pages/foo.html, other pages are siblings; index is ../index.html
        return filename === 'index.html' ? '../index.html' : filename;
    } else {
        // from root index.html, inner pages live in pages/
        return filename === 'index.html' ? 'index.html' : 'pages/' + filename;
    }
}


const PAGES = {
    'home':         'index.html',
    'about':        'about.html',
    'whoami':       'about.html',
    'education':    'education.html',
    'skills':       'skills.html',
    'experience':   'experience.html',
    'projects':     'projects.html',
    'publications': 'publications.html',
    'papers':       'publications.html',
    // 'conferences':  'conferences.html',
    'talks':        'talks.html',
    // 'misc':         'misc.html',
    'contact':      'contact.html',
    'email':        'contact.html',
    'github':       'https://github.com/jayprakashnair',
    'linkedin':     'https://linkedin.com/in/jayprakash-nair-8a937a18a',
    'resume':       'Jayprakash_Nair_long_Resume (3).pdf',
};

const NAV_ORDER = [
    { file: 'index.html',        label: 'Home' },
    { file: 'about.html',        label: 'About' },
    { file: 'education.html',    label: 'Education' },
    { file: 'skills.html',       label: 'Skills' },
    { file: 'experience.html',   label: 'Experience' },
    { file: 'projects.html',     label: 'Projects' },
    { file: 'publications.html', label: 'Papers' },
    // { file: 'conferences.html',  label: 'Conferences' },
    { file: 'talks.html',        label: 'Talks' },
    // { file: 'misc.html',         label: 'Misc' },
    { file: 'contact.html',      label: 'Contact' },
];

// ── THEME ───────────────────────────────────────────────────────
function applyStoredTheme() {
    const theme  = localStorage.getItem('theme')  || 'dark';
    const accent = localStorage.getItem('accent');
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = theme === 'dark' ? 'icons8-sun' : 'fas fa-moon';
    if (accent) document.documentElement.style.setProperty('--accent', accent);
}

function toggleTheme() {
    const cur  = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = next === 'dark' ? 'icons8-sun' : 'fas fa-moon';
}

function changeAccentColor(color) {
    document.documentElement.style.setProperty('--accent', color);
    localStorage.setItem('accent', color);
}

// ── NAV ─────────────────────────────────────────────────────────
function buildNav() {
    const container = document.getElementById('navMenu');
    if (!container) return;
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    NAV_ORDER.forEach(({ file, label }) => {
        const href = resolvePagePath(file);
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        a.className = 'nav-item' + (currentFile === file ? ' active' : '');
        a.addEventListener('click', () => {
            container.classList.remove('active');
            document.getElementById('overlay').classList.remove('open');
        });
        container.appendChild(a);
    });
}

// ── MODALS ──────────────────────────────────────────────────────
function closeAllModals() {
    document.getElementById('terminalModal')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('open');
    document.getElementById('navMenu')?.classList.remove('active');
}

function toggleMobileMenu() {
    document.getElementById('navMenu')?.classList.toggle('active');
    document.getElementById('overlay')?.classList.toggle('open');
}

function toggleSearch() {
    const modal = document.getElementById('terminalModal');
    if (!modal) return;
    if (modal.classList.contains('open')) {
        closeAllModals();
    } else {
        modal.classList.add('open');
        document.getElementById('overlay')?.classList.add('open');
        setTimeout(() => document.getElementById('cmdInput')?.focus(), 80);
    }
}

// ── TERMINAL OUTPUT HELPER ──────────────────────────────────────
function termPrint(outputEl, html) {
    if (!outputEl) return;
    const div = document.createElement('div');
    div.className = 'terminal-line';
    div.style.opacity = '1';
    div.innerHTML = `<span class="output-text">${html}</span>`;
    outputEl.appendChild(div);
    outputEl.scrollTop = outputEl.scrollHeight;
}

// ── COMMAND HANDLER ─────────────────────────────────────────────
function handleCommand(raw, outputEl) {
    const q = raw.toLowerCase().trim();
    if (!q) return;

    // Echo the typed command first
    const echo = document.createElement('div');
    echo.className = 'terminal-line';
    echo.style.opacity = '1';
    echo.innerHTML = `<span class="cmd-prompt">visitor:~$</span>&nbsp;<span class="cmd-text">${raw}</span>`;
    outputEl.appendChild(echo);

    // ── built-in commands ──
    if (q === 'clear') {
        outputEl.innerHTML = '';
        return;
    }

    if (q === 'help') {
        termPrint(outputEl, `
            <strong>Navigation:</strong> ${Object.keys(PAGES).join(' &nbsp;·&nbsp; ')}<br>
            <strong>Other:</strong> clear &nbsp;·&nbsp; exit`);
        return;
    }

    if (q === 'exit' || q === 'close') {
        closeAllModals();
        return;
    }

    // ── page navigation ──
    if (PAGES[q]) {
        const dest = PAGES[q];
        termPrint(outputEl, `→ Navigating to <span style="color:var(--accent)">${dest}</span>`);
        setTimeout(() => {
            if (dest.startsWith('http') || dest.endsWith('.pdf')) {
                window.open(resolvePagePath(dest), '_blank');
            } else {
                window.location.href = resolvePagePath(dest);
            }
        }, 350);
        return;
    }

    // ── keyword search inside current page ──
    const targets = [...document.querySelectorAll(
        'section, .glass-card, .pub-card, .timeline-content, p, h2, h3, .project-title, .project-desc, .role-title'
    )];

    const hits = targets.filter(el =>
        el.innerText && el.innerText.toLowerCase().includes(q)
    );

    if (hits.length > 0) {
        // Scroll to the first unique section-level hit
        const best = hits.find(el => el.closest('section')) || hits[0];
        best.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Flash highlight every hit
        hits.forEach(el => {
            el.style.outline = '2px solid var(--accent)';
            el.style.borderRadius = '4px';
            setTimeout(() => { el.style.outline = ''; el.style.borderRadius = ''; }, 2500);
        });

        termPrint(outputEl,
            `✓ Found <span style="color:var(--accent)">${hits.length}</span> match(es) for "<em>${raw}</em>" — highlighted on page.`);
    } else {
        termPrint(outputEl,
            `✗ No matches for "<em>${raw}</em>". Try <span style="color:var(--accent)">'help'</span> for all commands.`);
    }

    outputEl.scrollTop = outputEl.scrollHeight;
}

// ── WIRE UP BOTH TERMINALS (modal + landing sidebar) ────────────
function initTerminals() {
    // 1. Floating search modal terminal
    const modalInput  = document.getElementById('cmdInput');
    const modalOutput = document.getElementById('terminalOutput');
    if (modalInput && modalOutput) {
        modalInput.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const cmd = modalInput.value.trim();
            modalInput.value = '';
            if (cmd) handleCommand(cmd, modalOutput);
        });
    }

    // 2. Landing-page sidebar terminal (different IDs)
    const landingInput  = document.getElementById('landingInput');
    const landingOutput = document.getElementById('terminalLog');
    if (landingInput && landingOutput) {
        landingInput.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const cmd = landingInput.value.trim();
            landingInput.value = '';
            if (cmd) handleCommand(cmd, landingOutput);
        });
    }
}

// ── KEYBOARD SHORTCUT ───────────────────────────────────────────
document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleSearch(); }
    if (e.key === 'Escape') closeAllModals();
});

// ── SCROLL ROBOT ────────────────────────────────────────────────
function updateScrollRobot() {
    const robot = document.getElementById('scrollRobot');
    const fill  = document.getElementById('scrollFill');
    if (!robot || !fill) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    robot.style.top       = pct + '%';
    fill.style.height     = pct + '%';
    robot.style.transform = `translate(-50%, -50%) rotate(${window.scrollY * 0.5}deg)`;
}

function initScrollDragger() {
    const robot   = document.getElementById('scrollRobot');
    const tracker = document.getElementById('scrollTracker');
    if (!robot || !tracker) return;
    let drag = false;

    function scrub(clientY) {
        const r   = tracker.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
        window.scrollTo(0, pct * (document.documentElement.scrollHeight - window.innerHeight));
    }
    robot.addEventListener('mousedown',  () => { drag = true;  document.body.style.userSelect = 'none'; });
    window.addEventListener('mousemove', e => { if (drag) scrub(e.clientY); });
    window.addEventListener('mouseup',   () => { drag = false; document.body.style.userSelect = ''; });
    robot.addEventListener('touchstart', () => { drag = true; }, { passive: true });
    window.addEventListener('touchmove', e => { if (drag) { e.preventDefault(); scrub(e.touches[0].clientY); } }, { passive: false });
    window.addEventListener('touchend',  () => { drag = false; });
}

// ── CAROUSEL ────────────────────────────────────────────────────
function initCarousel(trackId, prevId, nextId, autoMs = 0) {
    const track = document.getElementById(trackId);
    if (!track) return;
    let cur = 0, timer = null;

    function go(n) {
        cur = ((n % track.children.length) + track.children.length) % track.children.length;
        track.style.transform = `translateX(-${cur * 100}%)`;
    }
    function resetTimer() {
        clearInterval(timer);
        if (autoMs) timer = setInterval(() => go(cur + 1), autoMs);
    }

    document.getElementById(prevId)?.addEventListener('click', () => { go(cur - 1); resetTimer(); });
    document.getElementById(nextId)?.addEventListener('click', () => { go(cur + 1); resetTimer(); });
    if (autoMs) timer = setInterval(() => go(cur + 1), autoMs);
}

// ── SHOW MORE TOGGLE ─────────────────────────────────────────────
function toggleExtra(contentId, btnId) {
    const el  = document.getElementById(contentId);
    const btn = document.getElementById(btnId);
    if (!el || !btn) return;
    const hidden = el.style.display === 'none' || el.style.display === '';
    el.style.display = hidden ? 'grid' : 'none';
    btn.innerHTML    = hidden
        ? 'Show Less <i class="fas fa-chevron-up"></i>'
        : 'Show More <i class="fas fa-chevron-down"></i>';
}

// ── INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    applyStoredTheme();
    buildNav();
    initTerminals();

    // Wire overlay dismiss AFTER shell.js has already created #overlay
    const ov = document.getElementById('overlay');
    if (ov) ov.addEventListener('click', closeAllModals);

    // Hide search bubble after 4s
    setTimeout(() => {
        const b = document.getElementById('searchBubble');
        if (b) b.style.display = 'none';
    }, 4000);

    window.addEventListener('scroll', updateScrollRobot);
    initScrollDragger();
});
