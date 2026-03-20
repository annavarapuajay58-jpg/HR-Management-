const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../hrms.db'),
  logging: false
});

async function checkSchema() {
  try {
    const [results] = await sequelize.query("PRAGMA table_info(Users);");
    console.log('--- Users Table Schema ---');
    console.log(JSON.stringify(results, null, 2));
    
    const [userCount] = await sequelize.query("SELECT COUNT(*) as count FROM Users;");
    console.log('User count:', userCount[0].count);
    
    const [users] = await sequelize.query("SELECT email, firstName, lastName, employeeId FROM Users LIMIT 5;");
    console.log('Users sample:', JSON.stringify(users, null, 2));

    await sequelize.close();
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();
