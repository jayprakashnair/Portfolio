/* ================================================================
   ANIMATIONS.JS — Drone Swarm + Global Flying Bots
   ================================================================ */

// ── HERO DRONE SWARM (index.html only) ───────────────────────────
let droneCanvasEl, droneCtx, droneParticles = [];
let mousePos = { x: -1000, y: -1000 };

class Particle {
    constructor(isTarget = false, targetX = 0, targetY = 0) {
        this.x = Math.random() * droneCanvasEl.width;
        this.y = Math.random() * droneCanvasEl.height;
        this.isTarget = isTarget;
        this.targetX = targetX;
        this.targetY = targetY;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = isTarget ? Math.random() * 1 + 2 : Math.random() * 2 + 1;
        this.color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
        this.friction = 0.94;
        this.ease = 0.05;
    }

    update(mouse) {
        if (this.isTarget) {
            let dx = this.targetX - this.x;
            let dy = this.targetY - this.y;
            let mdx = mouse.x - this.x;
            let mdy = mouse.y - this.y;
            let mDist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mDist < 50) {
                this.vx -= (mdx / mDist) * 2;
                this.vy -= (mdy / mDist) * 2;
            } else {
                this.vx += dx * this.ease * 0.1;
                this.vy += dy * this.ease * 0.1;
            }
            this.vx *= this.friction;
            this.vy *= this.friction;
        } else {
            if (this.x < 0 || this.x > droneCanvasEl.width)  this.vx *= -1;
            if (this.y < 0 || this.y > droneCanvasEl.height) this.vy *= -1;
        }
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        droneCtx.beginPath();
        droneCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        droneCtx.fillStyle = this.color;
        droneCtx.fill();
    }
}

function resizeDroneCanvas() {
    if (droneCanvasEl?.parentElement) {
        droneCanvasEl.width  = droneCanvasEl.parentElement.clientWidth;
        droneCanvasEl.height = droneCanvasEl.parentElement.clientHeight;
    }
}

function spawnDroneParticles() {
    droneParticles = [];
    if (!droneCanvasEl || droneCanvasEl.width === 0) return;

    const profilePic = document.querySelector('.profile-pic');
    let picRect = { top: 0, bottom: 0 };
    if (profilePic) {
        const r = profilePic.getBoundingClientRect();
        const p = droneCanvasEl.getBoundingClientRect();
        picRect.top    = r.top  - p.top;
        picRect.bottom = r.bottom - p.top;
    }

    const isMobile  = droneCanvasEl.width < 600;
    const fontSize  = isMobile ? 40 : 80;

    droneCtx.font      = `900 ${fontSize}px Rajdhani`;
    droneCtx.textAlign = 'center';
    droneCtx.textBaseline = 'middle';
    droneCtx.clearRect(0, 0, droneCanvasEl.width, droneCanvasEl.height);
    droneCtx.fillStyle = 'white';

    let yTop = picRect.top > 0 ? picRect.top - 250 : droneCanvasEl.height * 0.1;
    if (yTop < 50) yTop = 50;
    let yBottom = picRect.bottom > 0 ? picRect.bottom + 80 : droneCanvasEl.height * 0.6;

    droneCtx.fillText('Hello                👋', droneCanvasEl.width / 2, yTop);
    droneCtx.fillText("I'm Jayprakash Nair", droneCanvasEl.width / 2, yBottom);

    const imageData = droneCtx.getImageData(0, 0, droneCanvasEl.width, droneCanvasEl.height);
    const data = imageData.data;
    const gap = isMobile ? 2 : 3;

    for (let y = 0; y < droneCanvasEl.height; y += gap) {
        for (let x = 0; x < droneCanvasEl.width; x += gap) {
            if (data[(y * droneCanvasEl.width + x) * 4 + 3] > 128) {
                droneParticles.push(new Particle(true, x, y));
            }
        }
    }
    for (let i = 0; i < 40; i++) droneParticles.push(new Particle());
}

function animateDrones() {
    if (!droneCtx) return;
    droneCtx.clearRect(0, 0, droneCanvasEl.width, droneCanvasEl.height);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    droneParticles.forEach(p => { p.color = accent; p.update(mousePos); p.draw(); });
    requestAnimationFrame(animateDrones);
}

function initDrones() {
    droneCanvasEl = document.getElementById('droneCanvas');
    if (!droneCanvasEl) return;
    droneCtx = droneCanvasEl.getContext('2d');
    resizeDroneCanvas();
    window.addEventListener('resize', () => { resizeDroneCanvas(); spawnDroneParticles(); });
    droneCanvasEl.addEventListener('mousemove', e => {
        const rect = droneCanvasEl.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });
    // Wait briefly for profile pic layout to settle
    setTimeout(() => { spawnDroneParticles(); animateDrones(); }, 200);
}

// ── GLOBAL FLYING BOTS (all pages) ───────────────────────────────
let globalCanvas, globalCtx, globalBots = [];

class GlobalBot {
    constructor() { this.init(); }

    init() {
        this.x     = Math.random() * window.innerWidth;
        this.y     = Math.random() * window.innerHeight;
        this.type  = Math.random() > 0.5 ? 'tech' : 'bio';
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 1 + 0.5;
        this.size  = Math.random() * 3 + 3;
        this.color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
        this.flapState = 0;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.angle += (Math.random() - 0.5) * 0.05;
        if (this.x < -50)               this.x = window.innerWidth  + 50;
        if (this.x > window.innerWidth  + 50) this.x = -50;
        if (this.y < -50)               this.y = window.innerHeight + 50;
        if (this.y > window.innerHeight + 50) this.y = -50;
        this.flapState += 0.2;
    }

    draw() {
        globalCtx.save();
        globalCtx.translate(this.x, this.y);
        globalCtx.rotate(this.angle);
        globalCtx.strokeStyle = this.color;
        globalCtx.fillStyle   = this.color;

        if (this.type === 'tech') {
            globalCtx.beginPath();
            globalCtx.arc(0, 0, 2, 0, Math.PI * 2);
            globalCtx.moveTo(-this.size, -this.size); globalCtx.lineTo(this.size,  this.size);
            globalCtx.moveTo( this.size, -this.size); globalCtx.lineTo(-this.size, this.size);
            globalCtx.arc(-this.size, -this.size, 1.5, 0, Math.PI * 2);
            globalCtx.arc( this.size, -this.size, 1.5, 0, Math.PI * 2);
            globalCtx.arc( this.size,  this.size, 1.5, 0, Math.PI * 2);
            globalCtx.arc(-this.size,  this.size, 1.5, 0, Math.PI * 2);
            globalCtx.stroke();
        } else {
            const wY = Math.sin(this.flapState) * 3;
            globalCtx.beginPath();
            globalCtx.moveTo(5, 0);
            globalCtx.lineTo(-2,  wY);
            globalCtx.lineTo(-5,  0);
            globalCtx.lineTo(-2, -wY);
            globalCtx.closePath();
            globalCtx.stroke();
        }
        globalCtx.restore();
    }
}

function resizeGlobalCanvas() {
    globalCanvas.width  = window.innerWidth;
    globalCanvas.height = window.innerHeight;
}

function animateGlobalSwarm() {
    globalCtx.clearRect(0, 0, globalCanvas.width, globalCanvas.height);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    globalBots.forEach(b => { b.color = accent; b.update(); b.draw(); });
    requestAnimationFrame(animateGlobalSwarm);
}

function initGlobalSwarm() {
    globalCanvas = document.getElementById('globalCanvas');
    if (!globalCanvas) return;
    globalCtx = globalCanvas.getContext('2d');
    resizeGlobalCanvas();
    window.addEventListener('resize', resizeGlobalCanvas);
    for (let i = 0; i < 15; i++) globalBots.push(new GlobalBot());
    animateGlobalSwarm();
}

// ── HOLOGRAM ENTRANCE (index.html) ───────────────────────────────
function initHologram() {
    // Animations are CSS-driven; nothing extra needed unless you want JS control
}

// ── AUTO-INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initGlobalSwarm();
    if (document.getElementById('droneCanvas')) initDrones();
});
