const mongoose = require('mongoose');
const { User, Employee, Salary } = require('./models');
require('dotenv').config();

async function checkData() {
    try {
        await require("./config/mongodb");
        
        const userCount = await User.countDocuments();
        const employeeCount = await Employee.countDocuments();
        const salaryCount = await Salary.countDocuments();
        
        console.log(`Users: ${userCount}, Employees: ${employeeCount}, Salaries: ${salaryCount}`);
        
        if (salaryCount === 0 && employeeCount > 0) {
            console.log('No salaries found, creating dummy data for first employee...');
            const employee = await Employee.findOne();
            const months = ['January', 'February', 'March'];
            const year = 2026;
            
            for (const month of months) {
                await Salary.create({
                    employeeId: employee._id,
                    basicSalary: 50000,
                    bonus: 5000,
                    deductions: 2000,
                    netSalary: 53000,
                    month: month,
                    year: year,
                    status: 'Paid'
                });
            }
            console.log('Dummy salary records created.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
