const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const User = require(path.join(__dirname, 'backend', 'models', 'user'));
const Employee = require(path.join(__dirname, 'backend', 'models', 'employee'));

async function checkData() {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hamo_employees";
        console.log("Connecting to:", uri);
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => {
            console.log(`User: ${u.email}, ID: ${u._id}, Role: ${u.role}, Verified: ${u.isVerified}, Name: ${u.firstName} ${u.lastName}`);
        });

        const employees = await Employee.find({});
        console.log(`\nTotal Employees: ${employees.length}`);
        employees.forEach(e => {
            console.log(`Employee: ${e.firstName} ${e.lastName}, UserID: ${e.userId}, BaseSalary: ${e.baseSalary}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkData();
