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

        // Close menu when clicking a navigation link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ==========================================
    // Contact Form Submission Handling
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default browser refresh

            // Read form values
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const serviceRequired = document.getElementById('serviceRequired').value;
            const message = document.getElementById('message').value.trim();

            // Simple client-side validation check
            if (!fullName || !email || !phone || !serviceRequired || !message) {
                formFeedback.textContent = 'Please fill out all required fields.';
                formFeedback.className = 'form-feedback error';
                return;
            }

            // Simulated successful form submission message
            formFeedback.textContent = 'Thank you for your inquiry! JK Enterprise will contact you shortly.';
            formFeedback.className = 'form-feedback success';

            // Reset the form fields
            contactForm.reset();
        });
    }
});