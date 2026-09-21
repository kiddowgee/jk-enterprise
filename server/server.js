const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize Resend Client
const resendClient = new Resend(process.env.RESEND_API_KEY);

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Initialize Database Tables
async function initDb() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                account_type VARCHAR(50),
                full_name VARCHAR(100),
                company_name VARCHAR(100),
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                password VARCHAR(255) NOT NULL,
                address TEXT,
                reset_token VARCHAR(255),
                reset_token_expiry TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                user_email VARCHAR(100) REFERENCES users(email),
                items JSONB NOT NULL,
                days INT NOT NULL,
                start_date DATE NOT NULL,
                fulfillment_type VARCHAR(50),
                delivery_zone VARCHAR(50),
                delivery_address TEXT,
                subtotal NUMERIC,
                delivery_fee NUMERIC,
                grand_total NUMERIC,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database tables and reset columns initialized successfully.');
    } catch (err) {
        console.error('Database migration error:', err);
    }
}
initDb();

// -------------------------------------------------------------------------
// Authentication Routes
// -------------------------------------------------------------------------

app.post('/api/signup', async (req, res) => {
    const { accountType, name, company, email, phone, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (account_type, full_name, company_name, email, phone, password)
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING account_type AS "accountType", full_name AS "name", company_name AS "company", email, phone`,
            [accountType, name, company, email, phone, hashedPassword]
        );
        res.status(201).json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Signup DB error:', err);
        res.status(400).json({ success: false, error: 'Email already registered or invalid data.' });
    }
});

app.post('/api/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            `SELECT account_type AS "accountType", full_name AS "name", company_name AS "company", email, phone, password, address 
             FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            delete user.password;
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }
    } catch (err) {
        console.error('Signin DB error:', err);
        res.status(500).json({ success: false, error: 'Database error.' });
    }
});

// -------------------------------------------------------------------------
// Live Resend Email Password Reset Route
// -------------------------------------------------------------------------

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const userCheck = await pool.query('SELECT full_name FROM users WHERE email = $1', [email]);
        
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'No account found with this email address.' });
        }

        const name = userCheck.rows[0].full_name || 'Customer';
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour expiry

        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
            [token, expiry, email]
        );

        const resetLink = `https://kiddowgee.github.io/jk-enterprise/reset-password.html?token=${token}`;

        // Send Email via Resend API
        const emailResponse = await resendClient.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'JK Enterprise - Password Reset Security Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #111;">Password Reset Request</h2>
                    <p>Hello ${name},</p>
                    <p>We received a request to reset your password for your JK Enterprise account.</p>
                    <p>Click the button below to reset your password. This link expires in 1 hour:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #1a202c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="font-size: 0.9em; color: #555;">Or copy your security token manually:</p>
                    <p style="background: #f4f5f7; padding: 10px; font-family: monospace; border-radius: 4px; word-break: break-all;">${token}</p>
                    <p style="font-size: 0.8em; color: #888;">If you did not request this, please ignore this email.</p>
                </div>
            `
        });

        if (emailResponse.error) {
            console.error('Resend API error:', emailResponse.error);
            return res.status(500).json({ success: false, error: emailResponse.error.message || 'Failed to send reset email.' });
        }

        res.json({ 
            success: true, 
            message: 'A password reset link has been sent directly to your email address!' 
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, error: 'Failed to send reset email. Check server logs.' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const result = await pool.query(
            'SELECT email, reset_token_expiry FROM users WHERE reset_token = $1',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid reset token.' });
        }

        const user = result.rows[0];
        if (new Date() > new Date(user.reset_token_expiry)) {
            return res.status(400).json({ success: false, error: 'Reset token has expired. Please request a new one.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE email = $2',
            [hashedPassword, user.email]
        );

        res.json({ success: true, message: 'Password updated successfully! You can now sign in.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, error: 'Failed to reset password.' });
    }
});

// Profile Update Route
app.put('/api/users/profile', async (req, res) => {
    const { email, name, phone, company, address } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users 
             SET full_name = $1, phone = $2, company_name = $3, address = $4
             WHERE email = $5
             RETURNING account_type AS "accountType", full_name AS "name", company_name AS "company", email, phone, address`,
            [name, phone, company, address, email]
        );

        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(404).json({ success: false, error: 'User profile not found.' });
        }
    } catch (err) {
        console.error('Profile update DB error:', err);
        res.status(500).json({ success: false, error: 'Failed to update profile.' });
    }
});

// Bookings Routes
app.post('/api/bookings', async (req, res) => {
    const { userEmail, items, days, startDate, fulfillmentType, deliveryZone, deliveryAddress, subtotal, deliveryFee, grandTotal } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO bookings (user_email, items, days, start_date, fulfillment_type, delivery_zone, delivery_address, subtotal, delivery_fee, grand_total)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [userEmail, JSON.stringify(items), days, startDate, fulfillmentType, deliveryZone, deliveryAddress, subtotal, deliveryFee, grandTotal]
        );
        res.status(201).json({ success: true, bookingId: result.rows[0].id });
    } catch (err) {
        console.error('Booking DB error:', err);
        res.status(500).json({ success: false, error: 'Failed to record booking.' });
    }
});

app.get('/api/bookings/:email', async (req, res) => {
    const userEmail = req.params.email;
    try {
        const result = await pool.query(
            `SELECT id, items, days, start_date AS "startDate", fulfillment_type AS "fulfillmentType", 
                    delivery_zone AS "deliveryZone", grand_total AS "grandTotal", created_at AS "createdAt"
             FROM bookings 
             WHERE user_email = $1 
             ORDER BY created_at DESC`,
            [userEmail]
        );
        res.json({ success: true, bookings: result.rows });
    } catch (err) {
        console.error('Fetch bookings DB error:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve rental history.' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
