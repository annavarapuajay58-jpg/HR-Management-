const { User } = require('./backend/models');

async function checkUsers() {
    try {
        const users = await User.findAll();
        console.log('Total users:', users.length);
        users.forEach(u => {
            console.log(`---`);
            console.log(`  Email:      ${u.email}`);
            console.log(`  Role:       ${u.role}`);
            console.log(`  Verified:   ${u.isVerified}`);
            console.log(`  EmployeeId: ${u.employeeId}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
