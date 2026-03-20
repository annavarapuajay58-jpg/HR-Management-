const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../hrms.db'),
  logging: false
});

async function checkSchema() {
  try {
    const [results] = await sequelize.query("PRAGMA table_info(projects);");
    console.log(JSON.stringify(results, null, 2));
    await sequelize.close();
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

checkSchema();
