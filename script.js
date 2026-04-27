// ============================================
// Karisa Fadlina - Personal Website
// Sweet & Lovely JavaScript
// ============================================

// Wedding date - 9th of each month
const WEDDING_DAY = 9;
const WEDDING_YEAR = 2026;
const WEDDING_MONTH = 3; // April (0-indexed = 3)

// Secret key for access (you can change this)
const SECRET_KEY = "rifqikarisaku";

// ============================================
// Access Control
// ============================================

function checkAccess() {
    const hasAccess = localStorage.getItem('karisa_access');
    if (!hasAccess) {
        showLockScreen();
    } else {
        showMainContent();
    }
}

function showLockScreen() {
    document.body.classList.add('locked');
    document.body.innerHTML = `
        <div class="lock-screen">
            <div class="lock-icon">🔐</div>
            <h2>Halaman Pribadi</h2>
            <p>Masukkan kode akses untuk melihat</p>
            <input type="password" class="lock-input" id="accessCode" placeholder="Masukkan kode akses...">
            <button class="lock-btn" onclick="unlockPage()">Buka</button>
            <p class="lock-error" id="lockError">Kode akses salah!</p>
        </div>
    `;
}

function unlockPage() {
    const input = document.getElementById('accessCode').value;
    const errorMsg = document.getElementById('lockError');
    
    if (input === SECRET_KEY) {
        localStorage.setItem('karisa_access', 'true');
        location.reload();
    } else {
        errorMsg.classList.add('show');
    }
}

function showMainContent() {
    document.body.classList.remove('locked');
    initMainFeatures();
}

// ============================================
// Main Features
// ============================================

function initMainFeatures() {
    // Check if today is the wedding day (9th)
    const today = new Date();
    const isWeddingDay = today.getDate() === WEDDING_DAY;
    
    if (isWeddingDay) {
        triggerCelebration();
    }
    
    // Start countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Add floating elements animation
    animateFloatingElements();
}

// ============================================
// Countdown Timer
// ============================================

function updateCountdown() {
    const now = new Date();
    let targetDate = new Date(now.getFullYear(), now.getMonth(), WEDDING_DAY, 0, 0, 0);
    
    // If today is past the 9th, move to next month
    if (now.getDate() > WEDDING_DAY) {
        targetDate = new Date(now.getFullYear(), now.getMonth() + 1, WEDDING_DAY, 0, 0, 0);
    }
    
    // If today IS the 9th, show celebration mode
    if (now.getDate() === WEDDING_DAY) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        triggerCelebration();
        return;
    }
    
    const diff = targetDate - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// ============================================
// Celebration Mode
// ============================================

function triggerCelebration() {
    document.body.classList.add('celebrating');
    
    // Add confetti
    const confetti = document.getElementById('confetti');
    if (confetti) {
        confetti.classList.add('active');
    }
    
    // Add extra hearts
    createExtraHearts();
}

function createExtraHearts() {
    const container = document.querySelector('.container');
    const hearts = ['💕', '💖', '💗', '💞', '💘', '❤️'];
    
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('span');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.cssText = `
            position: fixed;
            font-size: ${Math.random() * 2 + 1}rem;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 3 + 3}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
            z-index: 100;
            pointer-events: none;
        `;
        document.body.appendChild(heart);
    }
}

// ============================================
// Floating Elements Animation
// ============================================

function animateFloatingElements() {
    const emojis = document.querySelectorAll('.floating-emoji');
    
    emojis.forEach((emoji, index) => {
        // Random initial positions
        emoji.style.left = Math.random() * 90 + '%';
        emoji.style.top = Math.random() * 90 + '%';
        
        // Continuous random movement
        setInterval(() => {
            emoji.style.left = Math.random() * 90 + '%';
            emoji.style.top = Math.random() * 90 + '%';
        }, 5000 + Math.random() * 5000);
    });
}

// ============================================
// Gallery Lightbox
// ============================================

function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            // Could add lightbox functionality here
        });
    });
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    checkAccess();
});

// Allow Enter key for unlock
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.getElementById('accessCode')) {
        unlockPage();
    }
});