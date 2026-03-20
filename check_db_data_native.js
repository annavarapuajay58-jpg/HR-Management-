const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function checkData() {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hamo_employees";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB via native driver");
        const db = client.db();

        const users = await db.collection('users').find({}).toArray();
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => {
            console.log(`User: ${u.email}, ID: ${u._id}, Role: ${u.role}, Verified: ${u.isVerified}, Name: ${u.firstName} ${u.lastName}`);
        });

        const employees = await db.collection('employees').find({}).toArray();
        console.log(`\nTotal Employees: ${employees.length}`);
        employees.forEach(e => {
            console.log(`Employee: ${e.firstName} ${e.lastName}, UserID: ${e.userId}, BaseSalary: ${e.baseSalary}`);
        });

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

checkData();
