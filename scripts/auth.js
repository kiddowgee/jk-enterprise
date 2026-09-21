document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://jk-enterprise-xqtu.onrender.com/api';

    // Mobile Navigation Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // Check Authentication State and Apply CSS Visibility Classes
    function checkAuthState() {
        const savedProfile = localStorage.getItem('jkUserProfile');
        const isLoggedIn = savedProfile && savedProfile !== '{}';

        if (isLoggedIn) {
            document.documentElement.classList.add('user-logged-in');
            document.body.classList.add('user-logged-in');

            // Populate avatar initials if header avatar exists
            try {
                const user = JSON.parse(savedProfile);
                const name = user.name || user.full_name || 'User';
                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
                const headerAvatar = document.getElementById('headerAvatar');
                if (headerAvatar) headerAvatar.textContent = initials;
            } catch (err) {
                console.error('Error parsing profile session:', err);
            }
        } else {
            document.documentElement.classList.remove('user-logged-in');
            document.body.classList.remove('user-logged-in');
        }
    }

    checkAuthState();

    // Sign Out Action
    const sidebarSignOutBtn = document.getElementById('sidebarSignOutBtn');
    if (sidebarSignOutBtn) {
        sidebarSignOutBtn.addEventListener('click', () => {
            localStorage.removeItem('jkUserProfile');
            window.location.href = 'signin.html';
        });
    }

    // Sign In / Sign Up Form Tab Switching Logic
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const switchToSignUp = document.getElementById('switchToSignUp');
    const switchToSignIn = document.getElementById('switchToSignIn');
    const accountType = document.getElementById('accountType');
    const companyNameGroup = document.getElementById('companyNameGroup');
    const authFeedback = document.getElementById('authFeedback');

    function showSignIn() {
        if (tabSignIn && tabSignUp && signInForm && signUpForm) {
            tabSignIn.classList.add('active');
            tabSignUp.classList.remove('active');
            signInForm.classList.add('active');
            signUpForm.classList.remove('active');
            if (authFeedback) authFeedback.textContent = '';
        }
    }

    function showSignUp() {
        if (tabSignIn && tabSignUp && signInForm && signUpForm) {
            tabSignUp.classList.add('active');
            tabSignIn.classList.remove('active');
            signUpForm.classList.add('active');
            signInForm.classList.remove('active');
            if (authFeedback) authFeedback.textContent = '';
        }
    }

    if (tabSignIn) tabSignIn.addEventListener('click', showSignIn);
    if (tabSignUp) tabSignUp.addEventListener('click', showSignUp);
    if (switchToSignUp) switchToSignUp.addEventListener('click', showSignUp);
    if (switchToSignIn) switchToSignIn.addEventListener('click', showSignIn);

    // Toggle Company Name Field during registration
    if (accountType && companyNameGroup) {
        accountType.addEventListener('change', () => {
            if (accountType.value === 'business') {
                companyNameGroup.style.display = 'block';
            } else {
                companyNameGroup.style.display = 'none';
            }
        });
    }

    // Handle Sign In Submission
    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (authFeedback) {
                authFeedback.textContent = 'Authenticating...';
                authFeedback.className = 'form-feedback';
            }

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const res = await fetch(`${API_URL}/signin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    localStorage.setItem('jkUserProfile', JSON.stringify(data.user));
                    if (authFeedback) {
                        authFeedback.textContent = 'Sign in successful! Redirecting...';
                        authFeedback.className = 'form-feedback success';
                    }
                    setTimeout(() => window.location.href = 'profile.html', 1000);
                } else {
                    if (authFeedback) {
                        authFeedback.textContent = data.error || 'Invalid credentials.';
                        authFeedback.className = 'form-feedback error';
                    }
                }
            } catch (err) {
                console.error('Sign in error:', err);
                if (authFeedback) {
                    authFeedback.textContent = 'Unable to connect to live server.';
                    authFeedback.className = 'form-feedback error';
                }
            }
        });
    }

    // Handle Sign Up Submission
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (authFeedback) {
                authFeedback.textContent = 'Creating account...';
                authFeedback.className = 'form-feedback';
            }

            const payload = {
                accountType: accountType.value,
                company: accountType.value === 'business' ? document.getElementById('regCompanyName').value : '',
                name: document.getElementById('regName').value,
                email: document.getElementById('regEmail').value,
                phone: document.getElementById('regPhone').value,
                password: document.getElementById('regPassword').value
            };

            try {
                const res = await fetch(`${API_URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    localStorage.setItem('jkUserProfile', JSON.stringify(data.user));
                    if (authFeedback) {
                        authFeedback.textContent = 'Account created successfully! Redirecting...';
                        authFeedback.className = 'form-feedback success';
                    }
                    setTimeout(() => window.location.href = 'profile.html', 1000);
                } else {
                    if (authFeedback) {
                        authFeedback.textContent = data.error || 'Failed to create account.';
                        authFeedback.className = 'form-feedback error';
                    }
                }
            } catch (err) {
                console.error('Sign up error:', err);
                if (authFeedback) {
                    authFeedback.textContent = 'Unable to connect to live server.';
                    authFeedback.className = 'form-feedback error';
                }
            }
        });
    }
});