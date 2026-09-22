document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // -------------------------------------------------------------------------
    // 1. PAGE RESTRICTION & ROUTE GUARDS
    // -------------------------------------------------------------------------
    // Allowed pages when NOT signed in: index.html, about.html, services/quote.html, signin.html
    const publicPages = ['index.html', 'about.html', 'quote.html', 'signin.html', 'reset-password.html'];
    
    // Pages requiring Admin status
    const adminPages = ['admin.html'];

    // Redirect signed-out users trying to directly access protected pages (profile, booking, services, contact)
    if (!currentUser && !publicPages.includes(currentPage)) {
        window.location.href = 'signin.html';
        return;
    }

    // Protect Admin Dashboard
    if (adminPages.includes(currentPage)) {
        if (!currentUser) {
            window.location.href = 'signin.html';
            return;
        }
        if (!currentUser.isAdmin && !currentUser.is_admin) {
            window.location.href = 'index.html';
            return;
        }
    }

    // -------------------------------------------------------------------------
    // 2. NAVBAR DISPLAY RULES
    // -------------------------------------------------------------------------
    if (currentUser) {
        document.querySelectorAll('.logged-out-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.logged-in-only').forEach(el => el.style.display = 'block');

        // Render user initials on header avatar
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar && currentUser.name) {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
            headerAvatar.textContent = initials.slice(0, 2);
        }

        if (currentUser.isAdmin || currentUser.is_admin) {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        }
    } else {
        document.querySelectorAll('.logged-out-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.logged-in-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
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

        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 4. AUTH MODAL INTERCEPTOR FOR BOOKING ACTIONS
    // -------------------------------------------------------------------------
    const authModal = document.getElementById('authModal');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');

    // Attach click listeners to all booking buttons across pages
    document.querySelectorAll('.book-now-btn, .proceed-booking-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!currentUser) {
                e.preventDefault();
                if (authModal) authModal.style.display = 'flex';
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
            window.location.href = 'signin.html';
        });
    }
});