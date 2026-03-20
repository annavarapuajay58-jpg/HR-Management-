const { sequelize } = require('./models');
const fs = require('fs');
async function check() {
  try {
    const [results] = await sequelize.query("PRAGMA table_info(Users)");
    fs.writeFileSync('db_check_output.json', JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (e) {
    fs.writeFileSync('db_check_output.json', JSON.stringify({ error: e.message }, null, 2));
    process.exit(1);
  }
}
check();
