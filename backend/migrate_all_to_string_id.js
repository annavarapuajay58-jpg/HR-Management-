const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

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

        const idFields = ['projectId', 'employeeId', 'teamLeadId', 'userId', 'authorId', 'createdBy'];
        const admin = await db.collection('users').findOne({ role: 'Admin' });
        const adminId = admin ? admin._id.toString() : 'SYSTEM';
        console.log(`Using Admin ID as fallback for createdBy: ${adminId}`);

        for (const colName of collections) {
            const collection = db.collection(colName);
            const docs = await collection.find({}).toArray();
            console.log(`Processing ${docs.length} documents in ${colName}`);

            for (const doc of docs) {
                let needsUpdate = false;
                const updateFields = {};

                // 1. Check _id field
                if (typeof doc._id !== 'string') {
                    const oldId = doc._id;
                    const stringId = oldId.toString();
                    console.log(`Migrating ${colName} _id: ${oldId} -> ${stringId}`);

                    const newDoc = { ...doc, _id: stringId };
                    
                    // Specific fixes for Tasks
                    if (colName === 'tasks' && !newDoc.createdBy) {
                        newDoc.createdBy = adminId;
                    }

                    // Convert other ID fields in the new document too
                    idFields.forEach(field => {
                        if (newDoc[field] !== undefined && newDoc[field] !== null && typeof newDoc[field] !== 'string') {
                            newDoc[field] = newDoc[field].toString();
                        }
                    });

                    try {
                        await collection.insertOne(newDoc);
                        await collection.deleteOne({ _id: oldId });
                    } catch (err) {
                        if (err.code === 11000) {
                            console.warn(`  - Warning: Document with ID ${stringId} already exists. Skipping.`);
                            await collection.deleteOne({ _id: oldId });
                        } else throw err;
                    }
                    continue; // Document replaced, move to next
                }

                // 2. Already string _id, but check foreign keys
                idFields.forEach(field => {
                    if (doc[field] !== undefined && doc[field] !== null && typeof doc[field] !== 'string') {
                        updateFields[field] = doc[field].toString();
                        needsUpdate = true;
                        console.log(`  - Converting ${colName}.${field} for doc ${doc._id}: ${doc[field]} -> string`);
                    }
                });

                // 3. Check Task createdBy specifically
                if (colName === 'tasks' && !doc.createdBy) {
                    updateFields.createdBy = adminId;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await collection.updateOne({ _id: doc._id }, { $set: updateFields });
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
