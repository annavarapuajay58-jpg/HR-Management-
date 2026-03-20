const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'hrms.db'),
  logging: false
});

async function listTables() {
  try {
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
    console.log('Tables:', results.map(r => r.name).join(', '));
    await sequelize.close();
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

listTables();
