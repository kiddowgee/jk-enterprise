document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Mobile Navigation Toggle
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        // Toggle mobile navigation menu open/close
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            const isExpanded = navLinks.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close navigation menu when clicking outside of it
        document.addEventListener('click', (event) => {
            if (!menuToggle.contains(event.target) && !navLinks.contains(event.target)) {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close navigation menu when a link inside it is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
});