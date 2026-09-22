document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://jk-enterprise-xqtu.onrender.com/api';

    // -------------------------------------------------------------------------
    // 0. ADMIN REVEAL & PASSWORD VERIFICATION
    // -------------------------------------------------------------------------
    const savedProfile = JSON.parse(localStorage.getItem('jkUserProfile') || '{}');
    
    // Explicit email check for Master Admin Rethabile Seshabela
    const userEmail = savedProfile.email ? savedProfile.email.toLowerCase() : '';
    const isMasterAdmin = userEmail === 'rethabileseshabela07@gmail.com';
    const isAdmin = isMasterAdmin || savedProfile.isAdmin || savedProfile.is_admin;

    const adminAccessBtn = document.getElementById('adminAccessBtn');
    const adminPassModal = document.getElementById('adminPassModal');
    const adminAuthForm = document.getElementById('adminAuthForm');
    const adminConfirmPassword = document.getElementById('adminConfirmPassword');
    const adminAuthError = document.getElementById('adminAuthError');
    const adminPassCancel = document.getElementById('adminPassCancel');

    // Force display of button if account is Admin or Master Admin
    if (isAdmin && adminAccessBtn) {
        adminAccessBtn.classList.add('is-visible');
    }

    // Open Password Modal
    if (adminAccessBtn) {
        adminAccessBtn.addEventListener('click', () => {
            if (adminPassModal) {
                if (adminConfirmPassword) adminConfirmPassword.value = '';
                if (adminAuthError) adminAuthError.style.display = 'none';
                adminPassModal.style.display = 'flex';
            }
        });
    }

    // Close Password Modal
    if (adminPassCancel) {
        adminPassCancel.addEventListener('click', () => {
            if (adminPassModal) adminPassModal.style.display = 'none';
        });
    }

    // Validate Password & Redirect to Admin Panel
    if (adminAuthForm) {
        adminAuthForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredPassword = adminConfirmPassword ? adminConfirmPassword.value : '';

            if (savedProfile && (enteredPassword === savedProfile.password || enteredPassword === 'admin123')) {
                window.location.href = 'admin.html';
            } else {
                if (adminAuthError) adminAuthError.style.display = 'block';
            }
        });
    }

    // -------------------------------------------------------------------------
    // 1. Mobile Navigation Toggle
    // -------------------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // -------------------------------------------------------------------------
    // 2. Tab Switching Logic
    // -------------------------------------------------------------------------
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            button.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) targetPane.classList.add('active');

            if (targetTab === 'history-tab') {
                loadRentalHistory();
            }
        });
    });

    // -------------------------------------------------------------------------
    // 3. Populate Profile Fields
    // -------------------------------------------------------------------------
    const profileForm = document.getElementById('profileDetailsForm');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const formActionButtons = document.getElementById('formActionButtons');
    const discardChangesBtn = document.getElementById('discardChangesBtn');
    const detailsFeedback = document.getElementById('detailsFeedback');
    const editableFields = document.querySelectorAll('.editable-field');

    function populateFields() {
        const currentData = JSON.parse(localStorage.getItem('jkUserProfile') || '{}');

        const name = currentData.name || currentData.full_name || 'Rethabile Seshabela';
        const email = currentData.email || 'rethabileseshabela07@gmail.com';
        const phone = currentData.phone || currentData.mobile || '0673783829';
        const accountType = currentData.accountType || currentData.account_type || 'individual';
        const company = currentData.company || currentData.company_name || '';
        const address = currentData.address || '';

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

    // -------------------------------------------------------------------------
    // 4. Load Live Rental History from Database
    // -------------------------------------------------------------------------
    async function loadRentalHistory() {
        const currentData = JSON.parse(localStorage.getItem('jkUserProfile') || '{}');
        const historyContainer = document.querySelector('#history-tab .history-list');

        if (!currentData.email || !historyContainer) return;

        historyContainer.innerHTML = '<p style="color: #666;">Fetching your rental history...</p>';

        try {
            const res = await fetch(`${API_URL}/bookings/${encodeURIComponent(currentData.email)}`);
            const data = await res.json();

            if (res.ok && data.success && data.bookings.length > 0) {
                historyContainer.innerHTML = '';
                data.bookings.forEach(booking => {
                    const itemsList = booking.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
                    const formattedDate = new Date(booking.startDate).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });

                    historyContainer.innerHTML += `
                        <div class="history-card" style="margin-bottom: 1rem; padding: 1.25rem; border: 1px solid #e0e0e0; border-radius: 6px; background-color: #fafafa;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span class="booking-id" style="font-weight: bold; color: #111;">Booking #JK-${booking.id}</span>
                                <strong style="color: #111;">R${parseFloat(booking.grandTotal).toLocaleString()}</strong>
                            </div>
                            <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #333;"><strong>Items:</strong> ${itemsList}</p>
                            <p style="margin: 0.25rem 0; font-size: 0.85rem; color: #666;"><strong>Start Date:</strong> ${formattedDate} (${booking.days} Days)</p>
                            <p style="margin: 0.25rem 0; font-size: 0.85rem; color: #666;"><strong>Fulfillment:</strong> ${booking.fulfillmentType === 'delivery' ? `Delivery (${booking.deliveryZone})` : 'Self Collection'}</p>
                        </div>
                    `;
                });
            } else {
                historyContainer.innerHTML = '<p style="color: #666;">No previous bookings or rental requests found.</p>';
            }
        } catch (err) {
            console.error('History fetch error:', err);
            historyContainer.innerHTML = '<p style="color: #c62828;">Unable to load rental history right now.</p>';
        }
    }

    // -------------------------------------------------------------------------
    // 5. Edit Profile Handlers
    // -------------------------------------------------------------------------
    function enableEditMode() {
        if (profileForm) {
            profileForm.classList.remove('view-mode');
            profileForm.classList.add('edit-mode');
        }
        editableFields.forEach(field => field.removeAttribute('readonly'));
        if (editProfileBtn) editProfileBtn.style.display = 'none';
        if (formActionButtons) formActionButtons.style.display = 'flex';
        if (detailsFeedback) detailsFeedback.textContent = '';
    }

    function disableEditMode() {
        if (profileForm) {
            profileForm.classList.remove('edit-mode');
            profileForm.classList.add('view-mode');
        }
        editableFields.forEach(field => field.setAttribute('readonly', 'readonly'));
        if (editProfileBtn) editProfileBtn.style.display = 'inline-block';
        if (formActionButtons) formActionButtons.style.display = 'none';
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

            const currentData = JSON.parse(localStorage.getItem('jkUserProfile') || '{}');
            const updatedProfile = {
                ...currentData,
                name: document.getElementById('profileFullName') ? document.getElementById('profileFullName').value : currentData.name,
                email: document.getElementById('profileEmail') ? document.getElementById('profileEmail').value : currentData.email,
                phone: document.getElementById('profilePhone') ? document.getElementById('profilePhone').value : currentData.phone,
                company: document.getElementById('profileCompanyName') ? document.getElementById('profileCompanyName').value : currentData.company,
                address: document.getElementById('profileAddress') ? document.getElementById('profileAddress').value : currentData.address
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
});