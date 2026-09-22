const API_URL = 'https://jk-enterprise-xqtu.onrender.com/api';

// Master User Accounts Store
let systemUsers = JSON.parse(localStorage.getItem('jkSystemUsers')) || [
    { id: 1, name: 'Rethabile Seshabela', email: 'rethabileseshabela07@gmail.com', role: 'Master Admin' },
    { id: 2, name: 'Standard Demo Account', email: 'user@jkenterprise.com', role: 'Standard User' }
];

document.addEventListener('DOMContentLoaded', () => {
    fetchStats();
    fetchBookings();
    renderUserTable();

    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('newUserName').value;
            const email = document.getElementById('newUserEmail').value;
            const role = document.getElementById('newUserRole').value === 'admin' ? 'Admin' : 'Standard User';

            // Default temporary password for newly created accounts
            const tempPassword = 'TempPassword123!';

            const newUser = {
                id: Date.now(),
                name,
                email,
                password: tempPassword,
                role,
                mustChangePassword: true
            };

            systemUsers.push(newUser);
            saveAndRenderUsers();

            // Sync with backend server
            try {
                await fetch(`${API_URL}/admin/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                });
            } catch (err) {
                console.error('Failed to sync user with backend:', err);
            }

            alert(`Account created for ${email}.\nTemporary Password: ${tempPassword}\n\nThe user will be prompted to set a new password on their first login.`);
            addUserForm.reset();
        });
    }
});

function saveAndRenderUsers() {
    localStorage.setItem('jkSystemUsers', JSON.stringify(systemUsers));
    renderUserTable();
    const statUsers = document.getElementById('statUsers');
    if (statUsers) {
        statUsers.textContent = systemUsers.length;
    }
}

function renderUserTable() {
    const tableBody = document.getElementById('userManagementTable');
    if (!tableBody) return;

    tableBody.innerHTML = systemUsers.map(user => {
        const isMaster = user.email.toLowerCase() === 'rethabileseshabela07@gmail.com';

        return `
            <tr>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td><strong>${isMaster ? 'Master Admin' : user.role}</strong></td>
                <td>
                    ${!isMaster ? `
                        <button onclick="toggleAdminRole('${user.email}')" class="btn-action btn-blue" style="margin-right: 0.5rem;">
                            ${user.role === 'Admin' ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                        <button onclick="deleteAccount('${user.email}')" class="btn-action btn-red">
                            Remove
                        </button>
                    ` : '<span style="color: #718096; font-size: 0.85rem;">Master Protected</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

window.toggleAdminRole = (email) => {
    systemUsers = systemUsers.map(u => {
        if (u.email.toLowerCase() === email.toLowerCase()) {
            u.role = u.role === 'Admin' ? 'Standard User' : 'Admin';
        }
        return u;
    });
    saveAndRenderUsers();
};

window.deleteAccount = (email) => {
    if (confirm(`Are you sure you want to permanently delete ${email}?`)) {
        systemUsers = systemUsers.filter(u => u.email.toLowerCase() !== email.toLowerCase());
        saveAndRenderUsers();
    }
};

async function fetchStats() {
    try {
        const res = await fetch(`${API_URL}/admin/stats`);
        const data = await res.json();
        if (data.success) {
            document.getElementById('statRevenue').textContent = `R ${data.stats.totalRevenue.toFixed(2)}`;
            document.getElementById('statBookings').textContent = data.stats.bookingsCount;
            document.getElementById('statPending').textContent = data.stats.pendingCount;
            document.getElementById('statUsers').textContent = Math.max(data.stats.usersCount, systemUsers.length);
        }
    } catch (err) {
        console.error('Failed to load admin stats:', err);
    }
}

async function fetchBookings() {
    const tableBody = document.getElementById('adminBookingsTable');
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_URL}/admin/bookings`);
        const data = await res.json();

        if (data.success && data.bookings.length > 0) {
            tableBody.innerHTML = data.bookings.map(order => `
                <tr>
                    <td><strong>#${order.id}</strong></td>
                    <td>${order.customerName || 'N/A'}</td>
                    <td>${order.userEmail}<br><small style="color:#718096;">${order.customerPhone || ''}</small></td>
                    <td>${new Date(order.startDate).toLocaleDateString()}</td>
                    <td><strong>R ${parseFloat(order.grandTotal).toFixed(2)}</strong></td>
                    <td><span class="badge badge-${(order.status || 'pending').toLowerCase()}">${order.status || 'Pending'}</span></td>
                    <td>
                        <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Approved" ${order.status === 'Approved' ? 'selected' : ''}>Approve</option>
                            <option value="Dispatched" ${order.status === 'Dispatched' ? 'selected' : ''}>Dispatch</option>
                            <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Complete</option>
                            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancel</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No rental orders found.</td></tr>';
        }
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Failed to connect to backend server.</td></tr>';
    }
}

async function updateOrderStatus(bookingId, newStatus) {
    try {
        const res = await fetch(`${API_URL}/admin/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            fetchStats();
            fetchBookings();
        } else {
            alert('Failed to update status.');
        }
    } catch (err) {
        alert('Connection error while updating status.');
    }
}