(function () {
    // -------------------------------------------------------------------------
    // Backend API URL Configuration
    // -------------------------------------------------------------------------
    const API_URL = 'https://jk-enterprise-xqtu.onrender.com/api';

    // 1. Session Persistence State
    const isLoggedIn = localStorage.getItem('jkUserLoggedIn') === 'true';

    // Apply visibility class immediately before render to avoid flickering
    if (isLoggedIn) {
        document.documentElement.classList.add('user-logged-in');
    } else {
        document.documentElement.classList.remove('user-logged-in');
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (isLoggedIn) {
            document.body.classList.add('user-logged-in');

            // Render profile initials in header
            const savedUser = JSON.parse(localStorage.getItem('jkUserProfile') || '{}');
            const avatarEl = document.getElementById('headerAvatar');
            if (savedUser.name && avatarEl) {
                const initials = savedUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
                avatarEl.textContent = initials;
            }
        } else {
            document.body.classList.remove('user-logged-in');
        }

        // -------------------------------------------------------------------------
        // 2. Account Type Selector Toggle (Individual vs Business)
        // -------------------------------------------------------------------------
        const accountTypeSelect = document.getElementById('accountType');
        const companyNameGroup = document.getElementById('companyNameGroup');
        const companyInput = document.getElementById('regCompanyName');

        if (accountTypeSelect && companyNameGroup) {
            accountTypeSelect.addEventListener('change', () => {
                if (accountTypeSelect.value === 'business') {
                    companyNameGroup.style.display = 'block';
                    if (companyInput) companyInput.setAttribute('required', 'required');
                } else {
                    companyNameGroup.style.display = 'none';
                    if (companyInput) companyInput.removeAttribute('required');
                }
            });
        }

        // -------------------------------------------------------------------------
        // 3. Tab Navigation Switching (Sign In / Sign Up)
        // -------------------------------------------------------------------------
        const tabSignIn = document.getElementById('tabSignIn');
        const tabSignUp = document.getElementById('tabSignUp');
        const signInForm = document.getElementById('signInForm');
        const signUpForm = document.getElementById('signUpForm');
        const switchToSignUp = document.getElementById('switchToSignUp');
        const switchToSignIn = document.getElementById('switchToSignIn');

        function showSignUp() {
            if (tabSignUp && tabSignIn && signUpForm && signInForm) {
                tabSignUp.classList.add('active');
                tabSignIn.classList.remove('active');
                signUpForm.classList.add('active');
                signInForm.classList.remove('active');
            }
        }

        function showSignIn() {
            if (tabSignUp && tabSignIn && signUpForm && signInForm) {
                tabSignIn.classList.add('active');
                tabSignUp.classList.remove('active');
                signInForm.classList.add('active');
                signUpForm.classList.remove('active');
            }
        }

        if (tabSignUp) tabSignUp.addEventListener('click', showSignUp);
        if (tabSignIn) tabSignIn.addEventListener('click', showSignIn);
        if (switchToSignUp) switchToSignUp.addEventListener('click', showSignUp);
        if (switchToSignIn) switchToSignIn.addEventListener('click', showSignIn);

        // -------------------------------------------------------------------------
        // 4. Remote API Form Submissions (Render Live Server)
        // -------------------------------------------------------------------------
        const feedbackEl = document.getElementById('authFeedback');

        // --- Sign In Request ---
        if (signInForm) {
            signInForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (feedbackEl) {
                    feedbackEl.textContent = 'Authenticating...';
                    feedbackEl.className = 'form-feedback';
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
                        localStorage.setItem('jkUserLoggedIn', 'true');

                        const isSubfolder = window.location.pathname.includes('/services/');
                        window.location.href = isSubfolder ? '../index.html' : 'index.html';
                    } else {
                        if (feedbackEl) {
                            feedbackEl.textContent = data.error || 'Invalid email or password.';
                            feedbackEl.className = 'form-feedback error';
                        }
                    }
                } catch (err) {
                    console.error('Sign-in network error:', err);
                    if (feedbackEl) {
                        feedbackEl.textContent = 'Unable to connect to live authentication server.';
                        feedbackEl.className = 'form-feedback error';
                    }
                }
            });
        }

        // --- Sign Up Request ---
        if (signUpForm) {
            signUpForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (feedbackEl) {
                    feedbackEl.textContent = 'Creating account...';
                    feedbackEl.className = 'form-feedback';
                }

                const accountType = accountTypeSelect ? accountTypeSelect.value : 'individual';
                const name = document.getElementById('regName').value;
                const company = accountType === 'business' && companyInput ? companyInput.value : '';
                const email = document.getElementById('regEmail').value;
                const phone = document.getElementById('regPhone').value;
                const password = document.getElementById('regPassword').value;

                try {
                    const res = await fetch(`${API_URL}/signup`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ accountType, name, company, email, phone, password })
                    });

                    const data = await res.json();

                    if (res.ok && data.success) {
                        localStorage.setItem('jkUserProfile', JSON.stringify(data.user));
                        localStorage.setItem('jkUserLoggedIn', 'true');

                        const isSubfolder = window.location.pathname.includes('/services/');
                        window.location.href = isSubfolder ? '../profile.html' : 'profile.html';
                    } else {
                        if (feedbackEl) {
                            feedbackEl.textContent = data.error || 'Failed to create account.';
                            feedbackEl.className = 'form-feedback error';
                        }
                    }
                } catch (err) {
                    console.error('Sign-up network error:', err);
                    if (feedbackEl) {
                        feedbackEl.textContent = 'Unable to connect to live server.';
                        feedbackEl.className = 'form-feedback error';
                    }
                }
            });
        }

        // -------------------------------------------------------------------------
        // 5. Intercept Booking Actions for Signed-out Users
        // -------------------------------------------------------------------------
        const rentalActionBtns = document.querySelectorAll('.service-cta, .booking-action');
        let authModal = document.getElementById('authModal');

        if (!authModal && !isLoggedIn) {
            authModal = document.createElement('div');
            authModal.id = 'authModal';
            authModal.className = 'modal-overlay';
            authModal.style.display = 'none';
            authModal.innerHTML = `
                <div class="modal-card">
                    <h3>Sign In Required</h3>
                    <p>You need to be signed in to proceed with booking or selecting this service. Would you like to sign in now?</p>
                    <div class="modal-actions">
                        <button id="modalCancel" class="modal-btn cancel">Cancel</button>
                        <button id="modalConfirm" class="modal-btn confirm">Sign In</button>
                    </div>
                </div>
            `;
            document.body.appendChild(authModal);
        }

        rentalActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetUrl = btn.getAttribute('href');

                if (!isLoggedIn && targetUrl && (targetUrl.includes('rent') || targetUrl.includes('booking'))) {
                    e.preventDefault();

                    if (authModal) {
                        authModal.style.display = 'flex';

                        document.getElementById('modalConfirm').onclick = () => {
                            const isSubfolder = window.location.pathname.includes('/services/');
                            window.location.href = isSubfolder ? '../signin.html' : 'signin.html';
                        };

                        document.getElementById('modalCancel').onclick = () => {
                            authModal.style.display = 'none';
                        };
                    }
                }
            });
        });

        // -------------------------------------------------------------------------
        // 6. Sign Out Action
        // -------------------------------------------------------------------------
        const signOutBtns = document.querySelectorAll('#sidebarSignOutBtn, #bottomSignOutBtn');
        signOutBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                localStorage.setItem('jkUserLoggedIn', 'false');
                localStorage.removeItem('jkUserProfile');

                const isSubfolder = window.location.pathname.includes('/services/');
                window.location.href = isSubfolder ? '../index.html' : 'index.html';
            });
        });
    });
})();