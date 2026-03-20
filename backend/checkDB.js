const mongoose = require('mongoose');
const fs = require('fs');
const { TeamInvitation, User, Project, Employee } = require('./models');

const checkInvitations = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/hamo_employees');
        console.log('Connected to MongoDB');

        const invitations = await TeamInvitation.find().populate('projectId').lean();
        const users = await User.find().select('_id email role firstName lastName').lean();
        const employees = await Employee.find().lean();
        
        const rawInvitations = await mongoose.connection.db.collection('teaminvitations').find({}).toArray();

        const results = {
            invitations,
            users,
            employees,
            rawInvitations,
            dbName: mongoose.connection.db.databaseName,
            collections: await mongoose.connection.db.listCollections().toArray()
        };

        fs.writeFileSync('db_check_results.json', JSON.stringify(results, null, 2));
        console.log('Results written to db_check_results.json');

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkInvitations();
