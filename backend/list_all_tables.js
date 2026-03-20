const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function listTables() {
  try {
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
    console.log('Tables:', results.map(r => r.name).join(', '));
    
    for (const table of results) {
        const [schema] = await sequelize.query(`PRAGMA table_info(${table.name});`);
        console.log(`Schema for ${table.name}:`, JSON.stringify(schema, null, 2));
    }
    await sequelize.close();
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

listTables();
