const initials = document.getElementById('floatingInitials');

document.getElementById('goToAbout').addEventListener('click', function() {
    document.getElementById('aboutme').scrollIntoView({ behavior: 'auto' });
});
document.getElementById('goToWorks').addEventListener('click', function() {
    document.getElementById('myworks').scrollIntoView({ behavior: 'auto' });
});
document.getElementById('goToContact').addEventListener('click', function() {
    document.getElementById('contactme').scrollIntoView({ behavior: 'auto' });
});

// Add scroll to top button functionality
var scrollToTopBtn = document.getElementById('scrollToTopBtn');
if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'auto' });
    });
}

// --- 3D Cube Scroll Animation ---
const canvas = document.getElementById('three-d-cube');
if (canvas) {
    const ctx = canvas.getContext('2d');
    const size = 180;
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    // 8 vertices of a cube
    const vertices = [
        [-1, -1, -1], [1, -1, -1],
        [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1],
        [1, 1, 1], [-1, 1, 1]
    ];
    // Edges between vertices
    const edges = [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7]
    ];

    // Rotation state
    let angleX = 0;
    let angleY = 0;
    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };

    function project([x, y, z], angleX, angleY) {
        // Rotate around Y axis
        let x1 = x * Math.cos(angleY) - z * Math.sin(angleY);
        let z1 = x * Math.sin(angleY) + z * Math.cos(angleY);
        // Rotate around X axis
        let y1 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);
        // Perspective projection
        let scale = size / (z2 + 4);
        return [
            center.x + x1 * scale,
            center.y + y1 * scale
        ];
    }

    function drawCube(angleX, angleY) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(120,130,180,0.7)';
        ctx.lineWidth = 2;
        edges.forEach(([i, j]) => {
            const [x1, y1] = project(vertices[i], angleX, angleY);
            const [x2, y2] = project(vertices[j], angleX, angleY);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        });
    }

    // Mouse interaction
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;
    });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMouse.x;
        const dy = e.clientY - lastMouse.y;
        angleY += dx * 0.01;
        angleX += dy * 0.01;
        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;
        drawCube(angleX, angleY);
    });
    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            lastMouse.x = e.touches[0].clientX;
            lastMouse.y = e.touches[0].clientY;
        }
    });
    window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - lastMouse.x;
        const dy = e.touches[0].clientY - lastMouse.y;
        angleY += dx * 0.01;
        angleX += dy * 0.01;
        lastMouse.x = e.touches[0].clientX;
        lastMouse.y = e.touches[0].clientY;
        drawCube(angleX, angleY);
    });
    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Scroll animation (still rotates on X as you scroll)
    function onScroll() {
        // Map scroll position to rotation angle (0 to pi/2)
        const rect = canvas.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        let visible = rect.top < windowHeight && rect.bottom > 0;
        if (!visible) return;
        let scrollY = window.scrollY || window.pageYOffset;
        let start = canvas.offsetTop - windowHeight / 2;
        let end = start + 400;
        let percent = Math.min(Math.max((scrollY - start) / (end - start), 0), 1);
        // Only update X rotation if not dragging
        if (!isDragging) {
            angleX = percent * Math.PI / 2;
            drawCube(angleX, angleY);
        }
    }

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);
    // Initial draw
    drawCube(angleX, angleY);
}

// Floating header buttons logic (observe header buttons)
const headerButtonIds = ['goToAbout', 'goToWorks', 'goToContact'];
const headerButtons = headerButtonIds.map(id => document.getElementById(id));
const floating = document.getElementById('floatingHeaderButtons');

let headerButtonsVisible = [true, true, true];

function updateFloatingVisibility() {
    if (!floating) return;
    // Show only if ALL header buttons are out of view
    if (headerButtonsVisible.every(v => !v)) {
        floating.classList.add('visible');
        if (initials) initials.classList.add('visible');
    } else {
        floating.classList.remove('visible');
        if (initials) initials.classList.remove('visible');
    }
}

if (window.IntersectionObserver) {
    headerButtons.forEach((btn, idx) => {
        if (!btn) return;
        const observer = new IntersectionObserver((entries) => {
            headerButtonsVisible[idx] = entries[0].isIntersecting;
            updateFloatingVisibility();
        }, { threshold: 0.01 });
        observer.observe(btn);
    });
    // Initial state
    updateFloatingVisibility();
} else {
    // Fallback: use scroll event (less accurate)
    function areHeaderButtonsInView() {
        return headerButtons.some(btn => {
            if (!btn) return false;
            const rect = btn.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < window.innerHeight;
        });
    }
    function fallbackToggle() {
        if (!floating) return;
        if (!areHeaderButtonsInView()) {
            floating.classList.add('visible');
            if (initials) initials.classList.add('visible');
        } else {
            floating.classList.remove('visible');
            if (initials) initials.classList.remove('visible');
        }
    }
    window.addEventListener('scroll', fallbackToggle);
    window.addEventListener('resize', fallbackToggle);
    document.addEventListener('DOMContentLoaded', fallbackToggle);
}

// Floating buttons functionality
const goToAboutFloating = document.getElementById('goToAboutFloating');
if (goToAboutFloating) {
    goToAboutFloating.addEventListener('click', function() {
        document.getElementById('aboutme').scrollIntoView({ behavior: 'auto' });
    });
}
const goToWorksFloating = document.getElementById('goToWorksFloating');
if (goToWorksFloating) {
    goToWorksFloating.addEventListener('click', function() {
        document.getElementById('myworks').scrollIntoView({ behavior: 'auto' });
    });
}
const goToContactFloating = document.getElementById('goToContactFloating');
if (goToContactFloating) {
    goToContactFloating.addEventListener('click', function() {
        document.getElementById('contactme').scrollIntoView({ behavior: 'auto' });
    });
}

const scrollToTopFloating = document.getElementById('scrollToTopFloating');
if (scrollToTopFloating) {
    scrollToTopFloating.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'auto' });
    });
}