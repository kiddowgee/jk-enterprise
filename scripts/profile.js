document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // Tab Switching Logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Populate Profile Fields
    const profileForm = document.getElementById('profileDetailsForm');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const formActionButtons = document.getElementById('formActionButtons');
    const discardChangesBtn = document.getElementById('discardChangesBtn');
    const detailsFeedback = document.getElementById('detailsFeedback');
    const editableFields = document.querySelectorAll('.editable-field');

    function populateFields() {
        const savedProfile = JSON.parse(localStorage.getItem('jkUserProfile') || '{}');

        // Fallbacks for both camelCase and snake_case property keys
        const name = savedProfile.name || savedProfile.full_name || '';
        const email = savedProfile.email || '';
        const phone = savedProfile.phone || savedProfile.mobile || '';
        const accountType = savedProfile.accountType || savedProfile.account_type || 'individual';
        const company = savedProfile.company || savedProfile.company_name || '';
        const address = savedProfile.address || '';

        if (name) {
            const sidebarName = document.getElementById('sidebarName');
            const sidebarEmail = document.getElementById('sidebarEmail');
            const avatarInitials = document.getElementById('avatarInitials');
            const headerAvatar = document.getElementById('headerAvatar');
            const sidebarAccountBadge = document.getElementById('sidebarAccountBadge');

            const inputAccountType = document.getElementById('profileAccountType');
            const inputCompany = document.getElementById('profileCompanyName');
            const companyGroup = document.getElementById('profileCompanyGroup');
            const inputName = document.getElementById('profileFullName');
            const inputEmail = document.getElementById('profileEmail');
            const inputPhone = document.getElementById('profilePhone');
            const inputAddress = document.getElementById('profileAddress');

            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

            if (sidebarName) sidebarName.textContent = name;
            if (sidebarEmail) sidebarEmail.textContent = email;
            if (avatarInitials) avatarInitials.textContent = initials;
            if (headerAvatar) headerAvatar.textContent = initials;

            if (sidebarAccountBadge) {
                sidebarAccountBadge.textContent = accountType === 'business' ? 'Business Client' : 'Individual';
            }

            if (inputAccountType) {
                inputAccountType.value = accountType === 'business' ? 'Company / Business Client' : 'Individual / Personal Use';
            }

            if (accountType === 'business' && companyGroup) {
                companyGroup.style.display = 'block';
                if (inputCompany) inputCompany.value = company;
            }

            if (inputName) inputName.value = name;
            if (inputEmail) inputEmail.value = email;
            if (inputPhone) inputPhone.value = phone;
            if (inputAddress) inputAddress.value = address;
        }
    }

    function enableEditMode() {
        profileForm.classList.remove('view-mode');
        profileForm.classList.add('edit-mode');
        editableFields.forEach(field => field.removeAttribute('readonly'));
        editProfileBtn.style.display = 'none';
        formActionButtons.style.display = 'flex';
        if (detailsFeedback) detailsFeedback.textContent = '';
    }

    function disableEditMode() {
        profileForm.classList.remove('edit-mode');
        profileForm.classList.add('view-mode');
        editableFields.forEach(field => field.setAttribute('readonly', 'readonly'));
        editProfileBtn.style.display = 'inline-block';
        formActionButtons.style.display = 'none';
    }

    populateFields();

    if (editProfileBtn) editProfileBtn.addEventListener('click', enableEditMode);

    if (discardChangesBtn) {
        discardChangesBtn.addEventListener('click', () => {
            populateFields();
            disableEditMode();
            if (detailsFeedback) {
                detailsFeedback.textContent = 'Changes discarded.';
                detailsFeedback.className = 'form-feedback';
            }
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const savedProfile = JSON.parse(localStorage.getItem('jkUserProfile') || '{}');
            const updatedProfile = {
                ...savedProfile,
                name: document.getElementById('profileFullName').value,
                email: document.getElementById('profileEmail').value,
                phone: document.getElementById('profilePhone').value,
                company: document.getElementById('profileCompanyName') ? document.getElementById('profileCompanyName').value : '',
                address: document.getElementById('profileAddress').value
            };

            localStorage.setItem('jkUserProfile', JSON.stringify(updatedProfile));
            populateFields();
            disableEditMode();

            if (detailsFeedback) {
                detailsFeedback.textContent = 'Personal information updated successfully!';
                detailsFeedback.className = 'form-feedback success';
            }
        });
    }

    const verificationForm = document.getElementById('verificationForm');
    const verificationFeedback = document.getElementById('verificationFeedback');

    if (verificationForm) {
        verificationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (verificationFeedback) {
                verificationFeedback.textContent = 'Verification documents uploaded and under review.';
                verificationFeedback.className = 'form-feedback success';
            }
        });
    }
});