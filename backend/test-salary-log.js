const { Employee, Salary, User } = require('./models');

async function testSalaryLog() {
    try {
        const emp = await Employee.findOne();
        if (!emp) {
            console.log("No employee found to test.");
            process.exit(0);
        }

        console.log(`Testing with Employee ID: ${emp.id}`);

        // Mock an API call to localhost:5000/api/payroll/update-salary/:id
        // Since it's protected, we might need a token. Actually, we can just call the controller logic directly 
        // OR better yet, let's just use the HTTP endpoint if we can bypass auth or we can generate a test token.
        // It's easier to just call the endpoint and see if auth blocks us... wait, it's Private (Admin, HR).
        // Let's generate a token first for the superadmin.
        
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: 'dummy', role: 'Admin' },
            process.env.JWT_SECRET || 'superhiddenhrsecret123',
            { expiresIn: '1h' }
        );

        const response = await fetch(`http://localhost:5000/api/payroll/update-salary/${emp.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                baseSalary: 60000,
                bonus: 2000,
                deductions: 500
            })
        });

        const resData = await response.json();
        console.log("API Response:", resData);

        // Verify in DB
        const salaries = await Salary.findAll({ where: { employeeId: emp.id } });
        console.log("Salaries after update:", salaries.map(s => s.toJSON()));

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

testSalaryLog();
