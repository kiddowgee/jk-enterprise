document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://jk-enterprise-xqtu.onrender.com/api';

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

            if (targetTab === 'history-tab') {
                loadRentalHistory();
            }
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

    // Load Live Rental History from Render Database
    async function loadRentalHistory() {
        const savedProfile = JSON.parse(localStorage.getItem('jkUserProfile') || '{}');
        const historyContainer = document.querySelector('#history-tab .history-list');

        if (!savedProfile.email || !historyContainer) return;

        historyContainer.innerHTML = '<p style="color: #666;">Fetching your rental history...</p>';

        try {
            const res = await fetch(`${API_URL}/bookings/${encodeURIComponent(savedProfile.email)}`);
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