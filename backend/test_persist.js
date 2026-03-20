const { User, Employee, sequelize } = require('./models');

async function testRegister() {
    const t = await sequelize.transaction();
    try {
        const testData = {
            email: 'test_persist@example.com',
            password: 'password123',
            role: 'Employee',
            firstName: 'Test',
            lastName: 'Persist',
            employeeId: 'TESTPERSIST001',
            verificationCode: '123456'
        };

        const user = await User.create(testData, { transaction: t });
        console.log('User created:', user.toJSON());

        await Employee.create({
            userId: user.id,
            firstName: testData.firstName,
            lastName: testData.lastName
        }, { transaction: t });

        await t.commit();
        
        const savedUser = await User.findOne({ where: { email: testData.email } });
        console.log('Saved User from DB:', savedUser.toJSON());

        const savedEmp = await Employee.findOne({ where: { userId: user.id } });
        console.log('Saved Employee from DB:', savedEmp.toJSON());

    } catch (error) {
        if (t) await t.rollback();
        console.error('Test Register Error:', error);
    } finally {
        await sequelize.close();
    }
}

testRegister();
