const { MongoClient, ObjectId } = require('mongodb');

async function cleanup() {
    const client = new MongoClient('mongodb://127.0.0.1:27017/hamo_employees');
    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection('attendances');
        
        console.log('--- Cleaning up Attendance IDs ---');
        const records = await collection.find().toArray();
        let updatedCount = 0;
        let orphanCount = 0;

        for (const record of records) {
            let needsUpdate = false;
            let updateData = {};

            // Convert _id to string if it's an ObjectId
            if (record._id instanceof ObjectId) {
                console.log(`Converting record _id to string: ${record._id}`);
                // Since _id is immutable in MongoDB, we have to re-insert
                const newRecord = { ...record, _id: record._id.toString() };
                await collection.insertOne(newRecord);
                await collection.deleteOne({ _id: record._id });
                needsUpdate = true; // Mark as updated for logging
                updatedCount++;
                // Update local record reference for дальнейшего checks if needed
                record._id = newRecord._id; 
            }

            // Ensure userId is string
            if (record.userId instanceof ObjectId) {
                updateData.userId = record.userId.toString();
                needsUpdate = true;
            }

            if (needsUpdate && Object.keys(updateData).length > 0) {
                await collection.updateOne({ _id: record._id }, { $set: updateData });
                updatedCount++;
            }

            // Check if orphan
            const user = await db.collection('users').findOne({ _id: record.userId });
            if (!user) {
                console.log(`Note: Orphaned record found for userId ${record.userId}`);
                orphanCount++;
            }
        }

        console.log(`Cleanup complete. Updated ${updatedCount} records. Found ${orphanCount} orphans.`);
    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        await client.close();
    }
}

cleanup();
