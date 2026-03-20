const { Salary, Employee, sequelize } = require('./backend/models');

async function testSalaryModel() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const salaries = await Salary.findAll({
            include: [{
                model: Employee,
                attributes: ['firstName', 'lastName']
            }]
        }).catch(err => {
            console.error('SQL Error details:', err.parent || err);
            throw err;
        });

        console.log(`Found ${salaries.length} records in Salaries table`);
    } catch (err) {
        // console.error('Salary model test failed:', err);
    } finally {
        await sequelize.close();
    }
}

testSalaryModel();
