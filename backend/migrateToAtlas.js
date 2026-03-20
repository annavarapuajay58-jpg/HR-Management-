/**
 * migrateToAtlas.js
 * Copies ALL data from your LOCAL MongoDB (localhost:27017/hamo_employees)
 * into your CLOUD MongoDB Atlas database.
 *
 * Usage:
 *   node migrateToAtlas.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const LOCAL_URI  = 'mongodb://127.0.0.1:27017/hamo_employees';
const ATLAS_URI  = process.env.MONGODB_URI;

// All collection names visible in your Compass screenshot
const COLLECTIONS = [
    'users',
    'employees',
    'attendances',
    'circulars',
    'leaves',
    'payrolls',
    'projectideas',
    'projects',
    'salaries',
    'tasks',
    'teaminvitations',
    'teammembers',
];

async function migrate() {
    if (!ATLAS_URI) {
        console.error('❌  MONGODB_URI is not set in your .env file!');
        process.exit(1);
    }

    console.log('📦  Connecting to LOCAL MongoDB...');
    const localConn  = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅  Local connected.\n');

    console.log('☁️   Connecting to ATLAS MongoDB...');
    const atlasConn  = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅  Atlas connected.\n');

    const localDb  = localConn.db;
    const atlasDb  = atlasConn.db;

    let totalMigrated = 0;

    for (const collName of COLLECTIONS) {
        try {
            const localDocs = await localDb.collection(collName).find({}).toArray();

            if (localDocs.length === 0) {
                console.log(`⏭️   ${collName}: empty, skipping.`);
                continue;
            }

            // Drop existing data in Atlas collection to avoid duplicates
            await atlasDb.collection(collName).deleteMany({});

            await atlasDb.collection(collName).insertMany(localDocs);
            console.log(`✅  ${collName}: migrated ${localDocs.length} document(s).`);
            totalMigrated += localDocs.length;
        } catch (err) {
            console.error(`❌  ${collName}: failed — ${err.message}`);
        }
    }

    console.log(`\n🎉  Migration complete! Total documents migrated: ${totalMigrated}`);

    await localConn.close();
    await atlasConn.close();
}

migrate().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
