const { Employee, User, sequelize } = require('./backend/models');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const employees = await Employee.findAll({
            include: [{
                model: User,
                attributes: ['email', 'role', 'employeeId']
            }],
        });

        console.log(`Found ${employees.length} employees`);
        if (employees.length > 0) {
            console.log('Sample employee data:', JSON.stringify(employees[0], null, 2));
        }
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await sequelize.close();
    }
}

test();
