const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function migrate() {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hamo_employees";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        console.log("Connected to MongoDB");

        // 1. Migrate Users
        const users = await db.collection('users').find({}).toArray();
        console.log(`Found ${users.length} users`);

        for (const user of users) {
            const oldId = user._id.toString();
            const newId = user.id;

            if (newId && oldId !== newId) {
                console.log(`Migrating user ${user.email}: ${oldId} -> ${newId}`);

                // Create new user doc with correct _id
                const newUser = { ...user, _id: newId };
                // Keep the original fields
                await db.collection('users').insertOne(newUser);

                // Update references in other collections
                await db.collection('employees').updateMany({ userId: oldId }, { $set: { userId: newId } });
                await db.collection('tasks').updateMany({ userId: oldId }, { $set: { userId: newId } });
                await db.collection('tasks').updateMany({ createdBy: oldId }, { $set: { createdBy: newId } });
                await db.collection('leaves').updateMany({ userId: oldId }, { $set: { userId: newId } });
                await db.collection('attendance').updateMany({ userId: oldId }, { $set: { userId: newId } });
                await db.collection('teaminvitations').updateMany({ employeeId: oldId }, { $set: { employeeId: newId } });
                await db.collection('teaminvitations').updateMany({ teamLeadId: oldId }, { $set: { teamLeadId: newId } });
                await db.collection('projects').updateMany({ teamLeadId: oldId }, { $set: { teamLeadId: newId } });

                // Delete old user doc
                await db.collection('users').deleteOne({ _id: user._id });
            }
        }

        // 2. Migrate Employees (if they have a separate id field)
        const employees = await db.collection('employees').find({}).toArray();
        console.log(`Found ${employees.length} employees`);

        for (const emp of employees) {
            const oldId = emp._id.toString();
            const newId = emp.id;

            if (newId && oldId !== newId) {
                console.log(`Migrating employee ${emp.firstName}: ${oldId} -> ${newId}`);

                const newEmp = { ...emp, _id: newId };
                await db.collection('employees').insertOne(newEmp);

                // Update references to Employee ID (like in Salaries)
                await db.collection('salaries').updateMany({ employeeId: oldId }, { $set: { employeeId: newId } });

                await db.collection('employees').deleteOne({ _id: emp._id });
            }
        }

        console.log("Migration completed.");

    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await client.close();
    }
}

migrate();
