const { sequelize } = require('./models');
async function check() {
  try {
    const [results, metadata] = await sequelize.query("PRAGMA table_info(Users)");
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
