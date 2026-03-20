const { User, Employee } = require('./backend/models');

async function check() {
    const users = await User.findAll({ include: [Employee] });
    users.forEach(u => {
        console.log(`User: ${u.email}, Role: ${u.role}, Employee profile: ${u.Employee ? 'Exists' : 'MISSING'}`);
    });
    process.exit(0);
}

check();
