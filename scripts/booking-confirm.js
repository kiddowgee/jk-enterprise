document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://jk-enterprise-xqtu.onrender.com/api';

    // Mobile Menu Navigation Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // Auto-fill Customer Details from Profile
    const custName = document.getElementById('custName');
    const custCompany = document.getElementById('custCompany');
    const companyGroup = document.getElementById('companyFieldGroup');
    const custEmail = document.getElementById('custEmail');
    const custPhone = document.getElementById('custPhone');
    const deliveryAddress = document.getElementById('deliveryAddress');
    const autofillProfileBtn = document.getElementById('autofillProfileBtn');

    function populateCustomerFromProfile() {
        const savedProfile = JSON.parse(localStorage.getItem('jkUserProfile') || '{}');

        if (savedProfile.name && custName) custName.value = savedProfile.name;
        if (savedProfile.email && custEmail) custEmail.value = savedProfile.email;
        if (savedProfile.phone && custPhone) custPhone.value = savedProfile.phone;
        if (savedProfile.address && deliveryAddress) deliveryAddress.value = savedProfile.address;

        if (savedProfile.accountType === 'business' && companyGroup) {
            companyGroup.style.display = 'block';
            if (custCompany) custCompany.value = savedProfile.company || '';
        }
    }

    populateCustomerFromProfile();

    if (autofillProfileBtn) {
        autofillProfileBtn.addEventListener('click', populateCustomerFromProfile);
    }

    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        startDateInput.value = tomorrow.toISOString().split('T')[0];
    }

    // Load Selected Items Summary & Calculate Total
    const savedData = localStorage.getItem('jkBookingData');
    
    if (!savedData) {
        const summaryBox = document.getElementById('selectedItemsSummary');
        if (summaryBox) {
            summaryBox.innerHTML = '<p style="color: #c62828;">No items selected. Please return to <a href="services.html">Services</a> to select rentals.</p>';
        }
        return;
    }

    const bookingData = JSON.parse(savedData);
    const summaryBox = document.getElementById('selectedItemsSummary');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryFulfillmentFee = document.getElementById('summaryFulfillmentFee');
    const summaryGrandTotal = document.getElementById('summaryGrandTotal');

    if (summaryBox && bookingData.items) {
        summaryBox.innerHTML = '';
        bookingData.items.forEach(item => {
            const itemTotal = item.price * item.quantity * bookingData.days;
            summaryBox.innerHTML += `
                <div class="summary-item" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                    <span>${item.name} (x${item.quantity}) &times; ${bookingData.days} Day(s)</span>
                    <strong>R${itemTotal.toLocaleString()}</strong>
                </div>
            `;
        });
    }

    if (summarySubtotal) {
        summarySubtotal.textContent = `R${(bookingData.itemsSubtotal || 0).toLocaleString()}`;
    }

    // Delivery calculation & out-of-radius restrictions
    const fulfillmentType = document.getElementById('fulfillmentType');
    const deliveryFields = document.getElementById('deliveryFields');
    const deliveryZone = document.getElementById('deliveryZone');
    const outOfRadiusNotice = document.getElementById('outOfRadiusNotice');
    const checkoutSubmitBtn = document.getElementById('checkoutSubmitBtn');

    let calculatedDeliveryFee = 0;
    let calculatedGrandTotal = 0;

    function calculateTotals() {
        let isOutOfRadius = false;
        calculatedDeliveryFee = 0;

        if (fulfillmentType && fulfillmentType.value === 'delivery') {
            if (deliveryFields) deliveryFields.style.display = 'block';

            const selectedOption = deliveryZone.options[deliveryZone.selectedIndex];
            const zoneValue = selectedOption.value;
            calculatedDeliveryFee = parseFloat(selectedOption.dataset.fee) || 0;

            if (zoneValue === 'out-of-radius') {
                isOutOfRadius = true;
                if (outOfRadiusNotice) outOfRadiusNotice.style.display = 'block';
                if (checkoutSubmitBtn) {
                    checkoutSubmitBtn.disabled = true;
                    checkoutSubmitBtn.style.opacity = '0.5';
                    checkoutSubmitBtn.style.cursor = 'not-allowed';
                }
            } else {
                if (outOfRadiusNotice) outOfRadiusNotice.style.display = 'none';
                if (checkoutSubmitBtn) {
                    checkoutSubmitBtn.disabled = false;
                    checkoutSubmitBtn.style.opacity = '1';
                    checkoutSubmitBtn.style.cursor = 'pointer';
                }
            }
        } else {
            if (deliveryFields) deliveryFields.style.display = 'none';
            if (outOfRadiusNotice) outOfRadiusNotice.style.display = 'none';
            if (checkoutSubmitBtn) {
                checkoutSubmitBtn.disabled = false;
                checkoutSubmitBtn.style.opacity = '1';
                checkoutSubmitBtn.style.cursor = 'pointer';
            }
        }

        const itemsSubtotal = bookingData.itemsSubtotal || 0;
        calculatedGrandTotal = itemsSubtotal + calculatedDeliveryFee;

        if (summaryFulfillmentFee) {
            summaryFulfillmentFee.textContent = isOutOfRadius ? 'N/A (Collection Required)' : `R${calculatedDeliveryFee.toLocaleString()}`;
        }
        if (summaryGrandTotal) summaryGrandTotal.textContent = `R${calculatedGrandTotal.toLocaleString()}`;
    }

    if (fulfillmentType) fulfillmentType.addEventListener('change', calculateTotals);
    if (deliveryZone) deliveryZone.addEventListener('change', calculateTotals);

    calculateTotals();

    // Submit Booking to Live PostgreSQL Server
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutFeedback = document.getElementById('checkoutFeedback');

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (checkoutFeedback) {
                checkoutFeedback.textContent = 'Submitting booking application...';
                checkoutFeedback.className = 'form-feedback';
            }

            const payload = {
                userEmail: custEmail.value,
                items: bookingData.items,
                days: bookingData.days,
                startDate: document.getElementById('startDate').value,
                fulfillmentType: fulfillmentType.value,
                deliveryZone: fulfillmentType.value === 'delivery' ? deliveryZone.value : 'N/A',
                deliveryAddress: fulfillmentType.value === 'delivery' ? deliveryAddress.value : 'Self Collection',
                subtotal: bookingData.itemsSubtotal,
                deliveryFee: calculatedDeliveryFee,
                grandTotal: calculatedGrandTotal
            };

            try {
                const res = await fetch(`${API_URL}/bookings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    if (checkoutFeedback) {
                        checkoutFeedback.textContent = `Booking #JK-${data.bookingId} confirmed and saved to your history! Redirecting...`;
                        checkoutFeedback.className = 'form-feedback success';
                    }
                    localStorage.removeItem('jkBookingData');
                    setTimeout(() => {
                        window.location.href = '../profile.html';
                    }, 2000);
                } else {
                    if (checkoutFeedback) {
                        checkoutFeedback.textContent = data.error || 'Failed to confirm booking.';
                        checkoutFeedback.className = 'form-feedback error';
                    }
                }
            } catch (err) {
                console.error('Booking submission error:', err);
                if (checkoutFeedback) {
                    checkoutFeedback.textContent = 'Unable to connect to live database server.';
                    checkoutFeedback.className = 'form-feedback error';
                }
            }
        });
    }
});