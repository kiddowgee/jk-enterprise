document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in via localStorage
    const savedProfile = localStorage.getItem('jkUserProfile');
    const isLoggedIn = savedProfile && savedProfile !== '{}';

    const authModal = document.getElementById('authModal');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');

    // Intercept all booking and rental action buttons
    const rentalButtons = document.querySelectorAll(
        '.book-now-btn, .rent-now-btn, .proceed-booking-btn, .btn-rent, [data-booking-target]'
    );

    rentalButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (!isLoggedIn) {
                // Stop direct navigation to booking execution page
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

    // Handle Modal Actions
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