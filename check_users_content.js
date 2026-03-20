const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'hrms.db'),
  logging: false
});

const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, primaryKey: true },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    employeeId: DataTypes.STRING,
    role: DataTypes.STRING
}, { timestamps: false });

async function checkUsers() {
  try {
    const users = await User.findAll({ raw: true });
    console.log('--- Users Table Content ---');
    console.log(JSON.stringify(users, null, 2));
    await sequelize.close();
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

checkUsers();
