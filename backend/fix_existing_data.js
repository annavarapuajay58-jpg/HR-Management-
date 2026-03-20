const { User, Employee, sequelize } = require('./models');

async function fixData() {
    try {
        const users = await User.findAll();
        console.log(`Checking ${users.length} users...`);

        for (const user of users) {
            let updated = false;
            let firstName = user.firstName;
            let lastName = user.lastName;
            let employeeId = user.employeeId;

            // Try to get from Employee table if missing in User table
            if (!firstName || !lastName) {
                const emp = await Employee.findOne({ where: { userId: user.id } });
                if (emp) {
                    firstName = firstName || emp.firstName;
                    lastName = lastName || emp.lastName;
                    updated = true;
                }
            }

            // Fallback to email prefix if still missing
            if (!firstName || firstName === 'N/A') {
                firstName = user.email.split('@')[0].split('.')[0];
                updated = true;
            }
            if (!lastName || lastName === 'N/A') {
                const parts = user.email.split('@')[0].split('.');
                lastName = parts.length > 1 ? parts[1] : 'User';
                updated = true;
            }

            // Dummy employeeId if missing
            if (!employeeId) {
                employeeId = 'EMP_' + user.email.split('@')[0].toUpperCase().substring(0, 5) + Math.floor(Math.random() * 1000);
                updated = true;
            }

            if (updated) {
                console.log(`Updating ${user.email}: ${firstName} ${lastName} (${employeeId})`);
                await user.update({ firstName, lastName, employeeId });
                
                // Ensure Employee record exists for Employee/Teamlead
                if (user.role === 'Employee' || user.role === 'Teamlead') {
                    const [emp, created] = await Employee.findOrCreate({
                        where: { userId: user.id },
                        defaults: { firstName, lastName }
                    });
                    if (!created && (emp.firstName !== firstName || emp.lastName !== lastName)) {
                        await emp.update({ firstName, lastName });
                    }
                }
            }
        }
        console.log('Data fix completed.');
    } catch (error) {
        console.error('Data fix error:', error);
    } finally {
        await sequelize.close();
    }
}

fixData();
