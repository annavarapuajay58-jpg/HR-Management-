const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function checkOtherDB() {
  try {
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
    console.log('Tables in database.sqlite:', results.map(r => r.name).join(', '));
    
    if (results.some(r => r.name === 'Users')) {
        const [users] = await sequelize.query("SELECT email, firstName, lastName, employeeId FROM Users LIMIT 5;");
        console.log('Users in database.sqlite:', JSON.stringify(users, null, 2));
    }
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOtherDB();
