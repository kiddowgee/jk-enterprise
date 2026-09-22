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

        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });

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

            if (parentCard) {
                const isExpanded = parentCard.classList.contains('expanded');

                if (isExpanded) {
                    parentCard.classList.remove('expanded');
                    if (parentCard.id === 'mobile-rentals') {
                        btn.innerHTML = 'View Fleet & Rates <span class="arrow">&darr;</span>';
                    } else if (parentCard.id === 'vehicle-rentals') {
                        btn.innerHTML = 'View Fleet, Rates & Verification <span class="arrow">&darr;</span>';
                    } else {
                        btn.innerHTML = 'View Details <span class="arrow">&darr;</span>';
                    }
                } else {
                    parentCard.classList.add('expanded');
                    btn.innerHTML = 'Hide Details <span class="arrow">&uarr;</span>';
                }
            }
        });
    });

    // -------------------------------------------------------------------------
    // 3. Intercept Rental Booking Actions (Shows Pop-up Modal)
    // -------------------------------------------------------------------------
    const authModal = document.getElementById('authModal');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');

    // Select rental buttons inside the expanded content drawers
    const rentalButtons = document.querySelectorAll('.btn-rent-action, .service-cta');

    rentalButtons.forEach(button => {
        // Allow unauthenticated custom quote requests
        if (button.getAttribute('href') === 'quote.html') return;

        button.addEventListener('click', (e) => {
            const savedProfile = localStorage.getItem('jkUserProfile');
            const isLoggedIn = savedProfile && savedProfile !== '{}';

            if (!isLoggedIn) {
                // Prevent routing to booking-confirm.html
                e.preventDefault();

                // Open Modal Popup
                if (authModal) {
                    authModal.style.display = 'flex';
                } else {
                    alert('Sign In Required: Please sign in or register to complete your rental booking.');
                    window.location.href = '../signin.html';
                }
            }
        });
    });

    // Modal Control Handlers
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