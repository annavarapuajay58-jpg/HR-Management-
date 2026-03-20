const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../hrms.db'),
  logging: false
});

async function checkConsolidated() {
  try {
    const query = `
      SELECT 
        u.email, 
        u.role, 
        u.firstName as user_firstName, 
        u.employeeId as user_employeeId,
        e.firstName as emp_firstName,
        e.lastName as emp_lastName
      FROM Users u
      LEFT JOIN Employees e ON u.id = e.userId
      LIMIT 10;
    `;
    const [results] = await sequelize.query(query);
    console.log('--- Consolidated User/Employee Data ---');
    console.log(JSON.stringify(results, null, 2));

    await sequelize.close();
  } catch (error) {
    console.error('Error checking data:', error);
  }
}

checkConsolidated();
