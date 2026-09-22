document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle
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

    // 2. Authentication State Check
    const savedProfile = localStorage.getItem('jkUserProfile');
    const isLoggedIn = savedProfile && savedProfile !== '{}';

    const authModal = document.getElementById('authModal');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');

    // 3. Intercept Rental Buttons ("Rent Bakkie / Trailer" & "Rent Mobile Facilities")
    const rentalButtons = document.querySelectorAll('.btn-rent-action, .rent-now-btn, .book-now-btn');

    rentalButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (!isLoggedIn) {
                // Stop direct navigation to booking confirmation page
                e.preventDefault();

                // Display Sign In Required Modal
                if (authModal) {
                    authModal.style.display = 'flex';
                } else {
                    alert('Sign In Required: Please sign in or register to continue with your rental booking.');
                    window.location.href = '../signin.html';
                }
            }
        });
    });

    // 4. Modal Confirmation Actions
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