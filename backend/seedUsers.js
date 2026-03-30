/**
 * seedUsers.js - Run this ONCE to create users in the correct collection with hashed passwords
 * Usage: node seedUsers.js
 * 
 * ⚠️  Edit the USERS array below with your actual employee details before running.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ─────────────────────────────────────────────
// ✏️  EDIT THIS LIST WITH YOUR ACTUAL EMPLOYEES
// ─────────────────────────────────────────────
const USERS = [
    {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@hamo.com',        // change to your admin email
        password: 'Admin@123',          // change to your desired password
        role: 'Admin',
        employeeId: 'EMP-ADMIN-001',
    },
    {
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr@hamo.com',           // change to your HR email
        password: 'Hr@123',
        role: 'HR',
        employeeId: 'EMP-HR-001',
    },
    // Add more employees below like this:
    // {
    //     firstName: 'John',
    //     lastName: 'Doe',
    //     email: 'john.doe@hamo.com',
    //     password: 'Employee@123',
    //     role: 'Employee',
    //     employeeId: 'EMP-001',
    // },
];
// ─────────────────────────────────────────────

const userSchema = new mongoose.Schema({
    _id: { type: String, default: () => crypto.randomUUID() },
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    employeeId: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'Employee' },
    isVerified: { type: Boolean, default: true },   // pre-verified so they can login immediately
    verificationCode: { type: String, default: null },
    resetCodeExpiry: { type: Date, default: null }
}, { timestamps: true });

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!\n');

        const User = mongoose.model('User', userSchema);

        for (const u of USERS) {
            const exists = await User.findOne({ $or: [{ email: u.email }, { employeeId: u.employeeId }] });
            if (exists) {
                console.log(`⏭️  Skipping ${u.email} — already exists.`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(u.password, 10);
            await User.create({
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                employeeId: u.employeeId,
                password: hashedPassword,
                role: u.role,
                isVerified: true,
            });
            console.log(`✅ Created user: ${u.email}  (role: ${u.role})`);
        }

        console.log('\n🎉 Seeding complete! These users can now login.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
