const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function migrate() {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hamo_employees";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        console.log("Connected to MongoDB for global ID migration");

        const collections = [
            'users', 'employees', 'tasks', 'leaves', 'attendance', 
            'salaries', 'projects', 'teaminvitations', 'circulars', 'projectideas'
        ];

        // 1. First, find a valid Admin ID to use as a fallback for missing required fields
        const admin = await db.collection('users').findOne({ role: 'Admin' });
        const adminId = admin ? admin._id.toString() : 'SYSTEM';
        console.log(`Using Admin ID as fallback for createdBy: ${adminId}`);

        for (const colName of collections) {
            const collection = db.collection(colName);
            const docs = await collection.find({}).toArray();
            console.log(`Processing ${docs.length} documents in ${colName}`);

            for (const doc of docs) {
                // Check if _id is an ObjectId (or anything else that isn't a string)
                if (typeof doc._id !== 'string') {
                    const oldId = doc._id;
                    const stringId = oldId.toString();
                    
                    console.log(`Migrating ${colName} doc: ${oldId} -> ${stringId}`);

                    const newDoc = { ...doc, _id: stringId };
                    
                    // Specific fixes for Tasks
                    if (colName === 'tasks') {
                        if (!newDoc.createdBy) {
                            newDoc.createdBy = adminId;
                            console.log(`  - Added missing createdBy for Task: ${newDoc.title}`);
                        }
                    }

                    try {
                        // Create new document with string _id
                        await collection.insertOne(newDoc);
                        // Delete the old one
                        await collection.deleteOne({ _id: oldId });
                    } catch (err) {
                        if (err.code === 11000) {
                            console.warn(`  - Warning: Document with ID ${stringId} already exists. Skipping.`);
                            // Optional: Delete the old one anyway if we're sure they are duplicates
                            await collection.deleteOne({ _id: oldId });
                        } else {
                            throw err;
                        }
                    }
                }
            }
        }

        console.log("Global Migration completed successfully.");

    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await client.close();
    }
}

migrate();
