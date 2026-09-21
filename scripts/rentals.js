document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    const qtyPickers = document.querySelectorAll('.qty-picker:not(.days-picker)');
    const daysPicker = document.querySelector('.days-picker');
    const daysInput = document.getElementById('rentalDays');
    const itemsSubtotalDisplay = document.getElementById('itemsSubtotal');

    // Calculate dynamic subtotal
    function calculateSubtotal() {
        let total = 0;
        const days = parseInt(daysInput.value) || 1;

        const hiddenInputs = document.querySelectorAll('.item-qty');
        hiddenInputs.forEach(input => {
            const qty = parseInt(input.value) || 0;
            const price = parseFloat(input.dataset.price) || 0;
            total += qty * price * days;
        });

        if (itemsSubtotalDisplay) {
            itemsSubtotalDisplay.textContent = `R${total.toLocaleString()}`;
        }
        return total;
    }

    // Plus / Minus Button Interactivity for Items (Min: 0)
    qtyPickers.forEach(picker => {
        const minusBtn = picker.querySelector('.qty-minus');
        const plusBtn = picker.querySelector('.qty-plus');
        const qtyValue = picker.querySelector('.qty-value');
        const hiddenInput = picker.querySelector('.item-qty');

        plusBtn.addEventListener('click', () => {
            let currentQty = parseInt(hiddenInput.value) || 0;
            currentQty++;
            hiddenInput.value = currentQty;
            qtyValue.textContent = currentQty;

            if (currentQty > 0) {
                minusBtn.classList.remove('btn-hidden');
            }

            calculateSubtotal();
        });

        minusBtn.addEventListener('click', () => {
            let currentQty = parseInt(hiddenInput.value) || 0;
            if (currentQty > 0) {
                currentQty--;
                hiddenInput.value = currentQty;
                qtyValue.textContent = currentQty;
            }

            if (currentQty === 0) {
                minusBtn.classList.add('btn-hidden');
            }

            calculateSubtotal();
        });
    });

    // Plus / Minus Button Interactivity for Days (Min: 1)
    if (daysPicker && daysInput) {
        const daysMinusBtn = daysPicker.querySelector('.days-minus');
        const daysPlusBtn = daysPicker.querySelector('.days-plus');
        const daysValue = daysPicker.querySelector('.days-value');

        daysPlusBtn.addEventListener('click', () => {
            let currentDays = parseInt(daysInput.value) || 1;
            currentDays++;
            daysInput.value = currentDays;
            daysValue.textContent = currentDays;

            if (currentDays > 1) {
                daysMinusBtn.classList.remove('btn-hidden');
            }

            calculateSubtotal();
        });

        daysMinusBtn.addEventListener('click', () => {
            let currentDays = parseInt(daysInput.value) || 1;
            if (currentDays > 1) {
                currentDays--;
                daysInput.value = currentDays;
                daysValue.textContent = currentDays;
            }

            if (currentDays === 1) {
                daysMinusBtn.classList.add('btn-hidden');
            }

            calculateSubtotal();
        });
    }

    // Form submission -> Save selection and redirect to confirmation
    const forms = [document.getElementById('mobileRentalForm'), document.getElementById('vehicleRentalForm')];

    forms.forEach(form => {
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const selectedItems = [];
                const days = parseInt(daysInput.value) || 1;
                const hiddenInputs = document.querySelectorAll('.item-qty');

                hiddenInputs.forEach(input => {
                    const qty = parseInt(input.value) || 0;
                    if (qty > 0) {
                        selectedItems.push({
                            name: input.dataset.name,
                            price: parseFloat(input.dataset.price),
                            quantity: qty
                        });
                    }
                });

                if (selectedItems.length === 0) {
                    alert('Please select at least one item quantity to proceed.');
                    return;
                }

                const bookingData = {
                    items: selectedItems,
                    days: days,
                    itemsSubtotal: calculateSubtotal()
                };

                localStorage.setItem('jkBookingData', JSON.stringify(bookingData));
                window.location.href = 'booking-confirm.html';
            });
        }
    });
});