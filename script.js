// ============================================
// 1. MENÚ HAMBURGUESA
// ============================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');
const body = document.body;

const overlay = document.createElement('div');
overlay.className = 'menu-overlay';
body.appendChild(overlay);

function toggleMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');
    body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
}

hamburger.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);
navLinksItems.forEach(item => item.addEventListener('click', () => {
    if (navLinks.classList.contains('active')) toggleMenu();
}));

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ============================================
// 2. SISTEMA DE AUDIO UNIFICADO (Web Audio API)
// ============================================
class TechAudio {
    constructor() {
        this.audioCtx = null;
        this.lastSoundTime = 0;
        this.init();
    }

    init() {
        // ⚠️ Los navegadores requieren interacción del usuario para permitir audio
        document.addEventListener('click', () => {
            if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        }, { once: true });

        // Sonido al hacer clic en enlaces del menú
        navLinksItems.forEach(link => link.addEventListener('click', () => this.play()));
    }

    // 🎵 MISMO SONIDO para menú Y para transiciones de sección
    play() {
        if (!this.audioCtx) return;
        
        const now = Date.now();
        if (now - this.lastSoundTime < 350) return; // Evita repetición rápida
        this.lastSoundTime = now;

        const t = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.08);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.start(t);
        osc.stop(t + 0.08);
    }
}

const techAudio = new TechAudio();

// ============================================
// 3. OBSERVADOR DE SECCIONES (Sonido + Link Activo)
// ============================================
const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            
            // Actualizar link activo en el menú
            navLinksItems.forEach(link => {
                const targetId = link.getAttribute('href').substring(1);
                link.classList.toggle('active', targetId === id);
            });

            // 🔊 Reproducir el MISMO sonido al entrar a Servicios, Destacados, Galería, etc.
            techAudio.play();
        }
    });
}, { threshold: 0.4, rootMargin: '-15% 0px -65% 0px' });

sections.forEach(section => sectionObserver.observe(section));

// ============================================
// 4. ANIMACIONES DE TARJETAS AL SCROLL
// ============================================
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            cardObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .featured-card, .gallery-item, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    cardObserver.observe(el);
});

// ============================================
// 5. VIDEO DE FONDO & HEADER
// ============================================
const bgVideo = document.getElementById('bg-video');
if (bgVideo) {
    bgVideo.play().catch(() => body.classList.add('no-video'));
    document.addEventListener('visibilitychange', () => {
        document.hidden ? bgVideo.pause() : bgVideo.play().catch(() => {});
    });
}

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.style.background = window.scrollY > 100 ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.85)';
    header.style.backdropFilter = window.scrollY > 100 ? 'blur(10px)' : 'blur(12px)';
});
