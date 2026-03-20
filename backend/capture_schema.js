const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../hrms.db'),
  logging: false
});

async function listTables() {
  try {
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
    let output = 'Tables: ' + results.map(r => r.name).join(', ') + '\n\n';
    
    for (const table of results) {
        const [schema] = await sequelize.query(`PRAGMA table_info(${table.name});`);
        output += `Schema for ${table.name}:\n${JSON.stringify(schema, null, 2)}\n\n`;
    }
    fs.writeFileSync(path.join(__dirname, 'db_structure.json'), output);
    console.log('Done mapping schema to db_structure.json');
    await sequelize.close();
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

listTables();
