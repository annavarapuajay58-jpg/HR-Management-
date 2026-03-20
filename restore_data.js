const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function restore() {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hamo_employees";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        console.log("Connected to MongoDB");

        const collections = [
            { file: 'users.json', collection: 'users', idField: 'id' },
            { file: 'employees.json', collection: 'employees', idField: 'id' },
            { file: 'tasks.json', collection: 'tasks', idField: 'id' },
            { file: 'leaves.json', collection: 'leaves', idField: 'id' },
            { file: 'attendences.json', collection: 'attendance', idField: 'id' },
            { file: 'projects.json', collection: 'projects', idField: 'id' },
            { file: 'team_invitations.json', collection: 'teaminvitations', idField: 'id' },
            { file: 'circulars.json', collection: 'circulars', idField: 'id' }
        ];

        for (const target of collections) {
            const filePath = path.join(__dirname, target.file);
            if (!fs.existsSync(filePath)) {
                console.log(`Skipping ${target.file} (not found)`);
                continue;
            }

            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (!Array.isArray(data) || data.length === 0) {
                console.log(`Skipping ${target.file} (empty)`);
                continue;
            }

            console.log(`Restoring ${data.length} records to ${target.collection}...`);
            
            // Clear existing data (to avoid duplicates or conflicts)
            await db.collection(target.collection).deleteMany({});

            const docs = data.map(item => {
                const doc = { ...item };
                if (doc[target.idField]) {
                    doc._id = doc[target.idField].toString();
                }
                // Specifically for some models where we changed types to Boolean or Date
                if (target.collection === 'users') {
                    if (doc.isVerified !== undefined) doc.isVerified = !!doc.isVerified;
                }
                if (doc.createdAt) doc.createdAt = new Date(doc.createdAt);
                if (doc.updatedAt) doc.updatedAt = new Date(doc.updatedAt);
                if (doc.date) doc.date = new Date(doc.date);
                if (doc.due) doc.due = new Date(doc.due);
                if (doc.fromDate) doc.fromDate = new Date(doc.fromDate);
                if (doc.toDate) doc.toDate = new Date(doc.toDate);
                if (doc.checkIn) doc.checkIn = new Date(doc.checkIn);
                if (doc.checkOut) doc.checkOut = new Date(doc.checkOut);
                
                return doc;
            });

            await db.collection(target.collection).insertMany(docs);
        }

        console.log("Restoration completed.");

    } catch (err) {
        console.error("Restoration error:", err);
    } finally {
        await client.close();
    }
}

restore();
