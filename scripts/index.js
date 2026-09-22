document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle Logic
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

        // Close menu when clicking links
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // 2. Account State Rules & Admin Visibility
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        // Hide sign-in button
        document.querySelectorAll('.logged-out-only').forEach(el => el.style.display = 'none');
        
        // Show profile & logout buttons
        document.querySelectorAll('.logged-in-only').forEach(el => el.style.display = 'block');

        // Check Admin privilege status
        if (currentUser.isAdmin || currentUser.is_admin) {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        }
    } else {
        document.querySelectorAll('.logged-out-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.logged-in-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    // Handle Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
});