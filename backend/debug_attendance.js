const { MongoClient } = require('mongodb');

async function check() {
    const client = new MongoClient('mongodb://127.0.0.1:27017/hamo_employees');
    try {
        await client.connect();
        const db = client.db();
        
        console.log('--- Attendance Records (Last 10) ---');
        const attendances = await db.collection('attendances').find().sort({date: -1}).limit(10).toArray();
        for (const a of attendances) {
            const user = await db.collection('users').findOne({ _id: a.userId });
            console.log({
                attendanceId: a._id,
                date: a.date,
                userId: a.userId,
                userIdType: typeof a.userId,
                userFound: !!user,
                userEmail: user?.email,
                userName: user ? `${user.firstName} ${user.lastName}` : 'N/A'
            });
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

check();
