document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 0. Check Auth State & Apply Body Classes
    // -------------------------------------------------------------------------
    function checkAuthState() {
        const savedProfile = localStorage.getItem('jkUserProfile');
        const isLoggedIn = savedProfile && savedProfile !== '{}';

        if (isLoggedIn) {
            document.body.classList.add('user-logged-in');

            try {
                const user = JSON.parse(savedProfile);
                const name = user.name || user.full_name || 'User';
                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
                const headerAvatar = document.getElementById('headerAvatar');
                if (headerAvatar) headerAvatar.textContent = initials.slice(0, 2);

                if (user.isAdmin || user.is_admin) {
                    document.body.classList.add('is-admin');
                } else {
                    document.body.classList.remove('is-admin');
                }
            } catch (err) {
                console.error('Error parsing session data:', err);
            }
        } else {
            document.body.classList.remove('user-logged-in');
            document.body.classList.remove('is-admin');
        }
    }

    checkAuthState();

    // -------------------------------------------------------------------------
    // 1. Mobile Navigation Menu Toggle
    // -------------------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });

        // Close menu when clicking any nav link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // -------------------------------------------------------------------------
    // 2. Expand/Collapse Details Drawer (.toggle-details-btn)
    // -------------------------------------------------------------------------
    const toggleButtons = document.querySelectorAll('.toggle-details-btn');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const parentCard = btn.closest('.service-card');
            const drawer = parentCard ? parentCard.querySelector('.service-details-drawer') : null;

            if (drawer) {
                const isCurrentlyOpen = drawer.classList.contains('active') || drawer.style.display === 'block';

                if (isCurrentlyOpen) {
                    drawer.classList.remove('active');
                    drawer.style.display = 'none';
                    
                    if (parentCard.id === 'mobile-rentals') {
                        btn.innerHTML = 'View Fleet & Rates <span class="arrow">&darr;</span>';
                    } else if (parentCard.id === 'vehicle-rentals') {
                        btn.innerHTML = 'View Fleet, Rates & Verification <span class="arrow">&darr;</span>';
                    } else {
                        btn.innerHTML = 'View Details <span class="arrow">&darr;</span>';
                    }
                } else {
                    drawer.classList.add('active');
                    drawer.style.display = 'block';
                    btn.innerHTML = 'Hide Details <span class="arrow">&uarr;</span>';
                }
            }
        });
    });

    // -------------------------------------------------------------------------
    // 3. Intercept Rental Booking Buttons for Unauthenticated Users
    // -------------------------------------------------------------------------
    const savedProfile = localStorage.getItem('jkUserProfile');
    const isLoggedIn = savedProfile && savedProfile !== '{}';

    const authModal = document.getElementById('authModal');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');

    const rentalButtons = document.querySelectorAll('.btn-rent-action, .service-cta');

    rentalButtons.forEach(button => {
        if (button.getAttribute('href') === 'quote.html') return;

        button.addEventListener('click', (e) => {
            if (!isLoggedIn) {
                e.preventDefault();

                if (authModal) {
                    authModal.style.display = 'flex';
                } else {
                    alert('Sign In Required: Please sign in or register to complete your rental booking.');
                    window.location.href = '../signin.html';
                }
            }
        });
    });

    // -------------------------------------------------------------------------
    // 4. Modal Confirmation Controls
    // -------------------------------------------------------------------------
    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            if (authModal) authModal.style.display = 'none';
        });
    }

    if (modalConfirm) {
        modalConfirm.addEventListener('click', () => {
            window.location.href = '../signin.html';
        });
    }
});