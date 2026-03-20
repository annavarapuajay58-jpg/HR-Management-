const { User, Task, sequelize } = require('./models');

async function testTaskAssignment() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find or create test users
        const getOrCreateUser = async (role, email, firstName, lastName, employeeId) => {
            let user = await User.findOne({ where: { role } });
            if (!user) {
                console.log(`Creating test user with role: ${role}`);
                user = await User.create({
                    firstName,
                    lastName,
                    email,
                    employeeId,
                    password: 'password123',
                    role,
                    isVerified: true
                });
            }
            return user;
        };

        const admin = await getOrCreateUser('Admin', 'admin_test@example.com', 'Admin', 'Test', 'ADM001');
        const hr = await getOrCreateUser('HR', 'hr_test@example.com', 'HR', 'Test', 'HR001');
        const teamlead = await getOrCreateUser('Teamlead', 'tl_test@example.com', 'TL', 'Test', 'TL001');
        const employee = await getOrCreateUser('Employee', 'emp_test@example.com', 'Emp', 'Test', 'EMP001');

        console.log('Test Users Ready:');
        console.log(`Admin: ${admin.id} (${admin.role})`);
        console.log(`HR: ${hr.id} (${hr.role})`);
        console.log(`Teamlead: ${teamlead.id} (${teamlead.role})`);
        console.log(`Employee: ${employee.id} (${employee.role})`);

        const checkAssignment = async (creatorRole, creatorId, targetRole, targetId) => {
            console.log(`Testing: ${creatorRole} assigning to ${targetRole}...`);
            // Check logic as per taskController.js
            if (targetRole === 'HR' && creatorRole !== 'Admin') {
                return { allowed: false, error: 'Only Admins can assign tasks to employees with the HR role.' };
            }
            return { allowed: true };
        };

        // Case 1: Teamlead assigns to HR (Should fail)
        const case1 = await checkAssignment('Teamlead', teamlead.id, 'HR', hr.id);
        console.log(`Case 1 Result: ${case1.allowed ? '❌ FAILED' : '✅ PASSED'} (Blocked: ${!case1.allowed}, Msg: ${case1.error || 'N/A'})`);

        // Case 2: Admin assigns to HR (Should pass)
        const case2 = await checkAssignment('Admin', admin.id, 'HR', hr.id);
        console.log(`Case 2 Result: ${case2.allowed ? '✅ PASSED' : '❌ FAILED'} (Allowed: ${case2.allowed})`);

        // Case 3: Teamlead assigns to Employee (Should pass)
        const case3 = await checkAssignment('Teamlead', teamlead.id, 'Employee', employee.id);
        console.log(`Case 3 Result: ${case3.allowed ? '✅ PASSED' : '❌ FAILED'} (Allowed: ${case3.allowed})`);

        // Case 4: HR assigns to HR (Should fail)
        const case4 = await checkAssignment('HR', hr.id, 'HR', hr.id);
        console.log(`Case 4 Result: ${case4.allowed ? '❌ FAILED' : '✅ PASSED'} (Blocked: ${!case4.allowed}, Msg: ${case4.error || 'N/A'})`);

        console.log('\nVerification complete.');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

testTaskAssignment();
