const { Employee, User, Salary } = require('../models');

// @desc    Get all employees with their salary info
// @route   GET /api/payroll/employees
// @access  Private (Admin, HR)
exports.getEmployeesWithSalaries = async (req, res) => {
    try {
        const employees = await Employee.find()
            .populate('userId', 'email role employeeId')
            .sort({ firstName: 1 })
            .lean();

        // format to match frontend expectation
        const formatted = employees.map(emp => {
            if (emp.userId) {
                emp.User = { 
                    email: emp.userId.email || 'N/A', 
                    role: emp.userId.role || 'Employee', 
                    employeeId: emp.userId.employeeId || 'N/A' 
                };
                emp.userId = emp.userId._id;
            } else {
                emp.User = { email: 'Missing Account', role: 'N/A', employeeId: 'N/A' };
            }
            // Mongoose creates id virtual, we manually add it or map _id to id
            emp.id = emp._id;
            return emp;
        });

        res.json(formatted);
    } catch (error) {
        console.error('Get employees with salaries error:', error);
        res.status(500).json({ error: 'Server error while fetching employee salaries' });
    }
};

// @desc    Update employee salary
// @route   PUT /api/payroll/update-salary/:id
// @access  Private (Admin, HR)
exports.updateSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const { baseSalary = 0, bonus = 0, deductions = 0 } = req.body;

        if (baseSalary === undefined || baseSalary === null) {
            return res.status(400).json({ error: 'Base Salary value is required' });
        }

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const parsedBase = parseFloat(baseSalary) || 0;
        const parsedBonus = parseFloat(bonus) || 0;
        const parsedDeductions = parseFloat(deductions) || 0;
        const netSalary = parsedBase + parsedBonus - parsedDeductions;

        employee.baseSalary = parsedBase;
        employee.bonus = parsedBonus;
        employee.deductions = parsedDeductions;
        employee.netSalary = netSalary;
        
        await employee.save();

        const date = new Date();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        const salary = new Salary({
            employeeId: employee._id,
            basicSalary: parsedBase,
            bonus: parsedBonus,
            deductions: parsedDeductions,
            netSalary: netSalary,
            month: monthNames[date.getMonth()],
            year: date.getFullYear(),
            status: 'Paid'
        });
        await salary.save();
        
        const employeeResponse = employee.toObject();
        employeeResponse.id = employeeResponse._id;

        res.json({ message: 'Salary updated and logged successfully', employee: employeeResponse });
    } catch (error) {
        console.error('Update salary error:', error);
        res.status(500).json({ error: 'Server error while updating salary' });
    }
};
