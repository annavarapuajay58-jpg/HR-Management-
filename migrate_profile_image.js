const sequelize = require('./backend/config/database');
const { QueryTypes } = require('sequelize');

async function migrate() {
    try {
        await sequelize.query("ALTER TABLE Employees ADD COLUMN profileImage TEXT", { type: QueryTypes.RAW });
        console.log("Migration successful: Added profileImage column to Employees table.");
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log("Column profileImage already exists.");
        } else {
            console.error("Migration failed:", error.message);
        }
    }
    process.exit(0);
}

migrate();
