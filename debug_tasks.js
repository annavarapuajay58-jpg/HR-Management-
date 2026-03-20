const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function checkTasks() {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hamo_employees";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();

        const srivani = await db.collection('users').findOne({ $or: [{ firstName: /Srivani/i }, { email: /srivani/i }] });
        if (srivani) {
            console.log("Srivani User:", JSON.stringify(srivani, null, 2));
            const tasks = await db.collection('tasks').find({ userId: srivani._id }).toArray();
            console.log(`Tasks for Srivani (${srivani._id}):`, JSON.stringify(tasks, null, 2));
            
            const allTasks = await db.collection('tasks').find({}).limit(5).toArray();
            console.log("Recent Tasks (sample):", JSON.stringify(allTasks, null, 2));
        } else {
            console.log("Srivani not found in users.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

checkTasks();
