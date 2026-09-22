document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 0. RETRIEVE USER SESSION (Uses standardized 'jkUserProfile' key)
    // -------------------------------------------------------------------------
    const savedProfile = localStorage.getItem('jkUserProfile');
    const currentUser = (savedProfile && savedProfile !== '{}') ? JSON.parse(savedProfile) : null;
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // -------------------------------------------------------------------------
    // 1. PAGE RESTRICTION & ROUTE GUARDS
    // -------------------------------------------------------------------------
    // Public pages reachable without logging in
    const publicPages = ['index.html', 'about.html', 'services.html', 'quote.html', 'signin.html', 'reset-password.html'];
    
    // Pages requiring Admin privileges
    const adminPages = ['admin.html'];

    // Protect Admin Dashboard
    if (adminPages.includes(currentPage)) {
        if (!currentUser) {
            window.location.href = window.location.pathname.includes('/services/') ? '../signin.html' : 'signin.html';
            return;
        }
        if (!currentUser.isAdmin && !currentUser.is_admin) {
            window.location.href = window.location.pathname.includes('/services/') ? '../index.html' : 'index.html';
            return;
        }
    }

    // Protect Profile & Direct Booking Confirmation Pages
    const protectedPages = ['profile.html', 'booking-confirm.html'];
    if (!currentUser && protectedPages.includes(currentPage)) {
        window.location.href = window.location.pathname.includes('/services/') ? '../signin.html' : 'signin.html';
        return;
    }

    // -------------------------------------------------------------------------
    // 2. NAVBAR DISPLAY RULES & BODY CLASSES
    // -------------------------------------------------------------------------
    if (currentUser) {
        document.body.classList.add('user-logged-in');

        // Render user initials on header avatar
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar) {
            const name = currentUser.name || currentUser.full_name || 'User';
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
            headerAvatar.textContent = initials.slice(0, 2);
        }

        if (currentUser.isAdmin || currentUser.is_admin) {
            document.body.classList.add('is-admin');
        } else {
            document.body.classList.remove('is-admin');
        }
    } else {
        document.body.classList.remove('user-logged-in');
        document.body.classList.remove('is-admin');
    }

    // -------------------------------------------------------------------------
    // 3. HAMBURGER MENU DRAWER TOGGLE
    // -------------------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });

        // Close dropdown when tapping anywhere outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });

        // Close dropdown when tapping any link inside
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // -------------------------------------------------------------------------
    // 4. AUTH MODAL INTERCEPTOR FOR BOOKING ACTIONS
    // -------------------------------------------------------------------------
    const authModal = document.getElementById('authModal');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');

    // Attach click listeners to all booking buttons
    document.querySelectorAll('.book-now-btn, .proceed-booking-btn, .btn-rent-action').forEach(btn => {
        if (btn.getAttribute('href') === 'quote.html') return;

        btn.addEventListener('click', (e) => {
            if (!currentUser) {
                e.preventDefault();
                if (authModal) {
                    authModal.style.display = 'flex';
                } else {
                    const redirectPath = window.location.pathname.includes('/services/') ? '../signin.html' : 'signin.html';
                    alert('Sign In Required: Please sign in to proceed with your booking.');
                    window.location.href = redirectPath;
                }
            }
        });
    });

    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            if (authModal) authModal.style.display = 'none';
        });
    }

    if (modalConfirm) {
        modalConfirm.addEventListener('click', () => {
            const redirectPath = window.location.pathname.includes('/services/') ? '../signin.html' : 'signin.html';
            window.location.href = redirectPath;
        });
    }
});