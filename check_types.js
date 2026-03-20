const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function checkData() {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hamo_employees";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();

        const user = await db.collection('users').findOne({});
        if (user) {
            console.log("User _id type:", typeof user._id, user._id.constructor.name);
            console.log("User isVerified type:", typeof user.isVerified);
        }

        const employee = await db.collection('employees').findOne({});
        if (employee) {
            console.log("Employee _id type:", typeof employee._id, employee._id.constructor.name);
            console.log("Employee userId type:", typeof employee.userId, employee.userId?.constructor?.name);
            console.log("Employee userId value:", employee.userId);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

checkData();
