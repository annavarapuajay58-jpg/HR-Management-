const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../hrms.db'),
  logging: false
});

async function verifyAll() {
  let report = '';
  try {
    const [userCols] = await sequelize.query("PRAGMA table_info(Users);");
    report += '--- Users Columns ---\n' + JSON.stringify(userCols, null, 2) + '\n\n';

    const [empCols] = await sequelize.query("PRAGMA table_info(Employees);");
    report += '--- Employees Columns ---\n' + JSON.stringify(empCols, null, 2) + '\n\n';

    const query = `
      SELECT 
        u.email, 
        u.role, 
        u.firstName as user_fname, 
        u.lastName as user_lname,
        u.employeeId as user_eid,
        e.firstName as emp_fname,
        e.lastName as emp_lname
      FROM Users u
      LEFT JOIN Employees e ON u.id = e.userId
      WHERE u.email = 'seelamsrilekha2003@gmail.com';
    `;
    const [results] = await sequelize.query(query);
    report += '--- Data for seelamsrilekha2003@gmail.com ---\n' + JSON.stringify(results, null, 2) + '\n';

    fs.writeFileSync('db_report.txt', report);
    console.log('Report written to db_report.txt');
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAll();
