(function () {
    const isLoggedIn = localStorage.getItem('jkUserLoggedIn') === 'true';

    // Set state class immediately
    if (isLoggedIn) {
        document.documentElement.classList.add('user-logged-in');
    } else {
        document.documentElement.classList.remove('user-logged-in');
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (isLoggedIn) {
            document.body.classList.add('user-logged-in');

            // Set user avatar initials
            const savedUser = JSON.parse(localStorage.getItem('jkUserProfile') || '{}');
            const avatarEl = document.getElementById('headerAvatar');
            if (savedUser.name && avatarEl) {
                const initials = savedUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
                avatarEl.textContent = initials;
            }
        } else {
            document.body.classList.remove('user-logged-in');
        }

        // ==========================================
        // Account Type Toggle (Individual vs Business)
        // ==========================================
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

        // ==========================================
        // Sign In / Sign Up Tab Switching
        // ==========================================
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

        // ==========================================
        // Form Submissions
        // ==========================================
        if (signInForm) {
            signInForm.addEventListener('submit', (e) => {
                e.preventDefault();
                localStorage.setItem('jkUserLoggedIn', 'true');

                const isSubfolder = window.location.pathname.includes('/services/');
                window.location.href = isSubfolder ? '../index.html' : 'index.html';
            });
        }

        if (signUpForm) {
            signUpForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const accountType = accountTypeSelect ? accountTypeSelect.value : 'individual';
                const name = document.getElementById('regName').value;
                const company = accountType === 'business' && companyInput ? companyInput.value : '';
                const email = document.getElementById('regEmail').value;
                const phone = document.getElementById('regPhone').value;

                // Save user profile details
                const profilePayload = {
                    accountType,
                    name,
                    company,
                    email,
                    phone
                };

                localStorage.setItem('jkUserProfile', JSON.stringify(profilePayload));
                localStorage.setItem('jkUserLoggedIn', 'true');

                const isSubfolder = window.location.pathname.includes('/services/');
                window.location.href = isSubfolder ? '../profile.html' : 'profile.html';
            });
        }

        // ==========================================
        // Sign Out Action (Profile Page)
        // ==========================================
        const signOutBtns = document.querySelectorAll('#sidebarSignOutBtn, #bottomSignOutBtn');
        signOutBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                localStorage.setItem('jkUserLoggedIn', 'false');

                const isSubfolder = window.location.pathname.includes('/services/');
                window.location.href = isSubfolder ? '../index.html' : 'index.html';
            });
        });
    });
})();