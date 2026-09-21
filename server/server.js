const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for frontend requests
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Render Postgres
});

// Initialize Database Tables
async function initDb() {
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

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
    console.log('Database tables initialized successfully.');
}
initDb().catch(console.error);

// Auth Routes - Formatted keys to camelCase for frontend compatibility
app.post('/api/signup', async (req, res) => {
    const { accountType, name, company, email, phone, password } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO users (account_type, full_name, company_name, email, phone, password)
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING account_type AS "accountType", full_name AS "name", company_name AS "company", email, phone`,
            [accountType, name, company, email, phone, password]
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
            `SELECT account_type AS "accountType", full_name AS "name", company_name AS "company", email, phone, address 
             FROM users WHERE email = $1 AND password = $2`,
            [email, password]
        );
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }
    } catch (err) {
        console.error('Signin DB error:', err);
        res.status(500).json({ success: false, error: 'Database error.' });
    }
});

// Booking Route
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));