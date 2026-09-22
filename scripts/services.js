document.addEventListener('DOMContentLoaded', () => {
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
    }

    // -------------------------------------------------------------------------
    // 2. Expand/Collapse Details Drawer (.toggle-details-btn)
    // -------------------------------------------------------------------------
    const toggleButtons = document.querySelectorAll('.toggle-details-btn');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Find parent article card and select its drawer container
            const parentCard = btn.closest('.service-card');
            const drawer = parentCard ? parentCard.querySelector('.service-details-drawer') : null;

            if (drawer) {
                const isCurrentlyOpen = drawer.classList.contains('active') || drawer.style.display === 'block';

                if (isCurrentlyOpen) {
                    drawer.classList.remove('active');
                    drawer.style.display = 'none';
                    
                    // Reset button text based on service section
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

    // Select rental buttons
    const rentalButtons = document.querySelectorAll('.btn-rent-action, .service-cta');

    rentalButtons.forEach(button => {
        // Skip quote button if user is filling out a general inquiry
        if (button.getAttribute('href') === 'quote.html') return;

        button.addEventListener('click', (e) => {
            if (!isLoggedIn) {
                // Prevent direct navigation to booking confirmation page
                e.preventDefault();

                // Show Sign In Required Modal
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