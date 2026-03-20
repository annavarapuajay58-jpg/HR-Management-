const sequelize = require('./config/database');

async function alterTable() {
    try {
        await sequelize.query("ALTER TABLE Employees ADD COLUMN baseSalary REAL DEFAULT 0;");
        await sequelize.query("ALTER TABLE Employees ADD COLUMN bonus REAL DEFAULT 0;");
        await sequelize.query("ALTER TABLE Employees ADD COLUMN deductions REAL DEFAULT 0;");
        await sequelize.query("ALTER TABLE Employees ADD COLUMN netSalary REAL DEFAULT 0;");
        console.log("Migration columns added successfully.");
    } catch (e) {
        console.error("Migration failed (columns might already exist): " + e.message);
    }
    process.exit(0);
}

alterTable();
