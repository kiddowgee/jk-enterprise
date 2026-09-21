document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Mobile Navigation Toggle
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            const isExpanded = navLinks.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!menuToggle.contains(event.target) && !navLinks.contains(event.target)) {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu when a navigation link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ==========================================
    // Animated Expandable Service Cards
    // ==========================================
    const detailButtons = document.querySelectorAll('.toggle-details-btn');

    detailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.service-card');
            const isExpanded = card.classList.contains('expanded');

            // Toggle expanded class
            card.classList.toggle('expanded');

            // Toggle button label
            if (isExpanded) {
                button.innerHTML = 'View Details <span class="arrow">&darr;</span>';
            } else {
                button.innerHTML = 'Hide Details <span class="arrow">&darr;</span>';
            }
        });
    });
});