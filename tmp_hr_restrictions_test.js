const { getAllLeaves, updateLeaveStatus } = require('./backend/controllers/leaveController');
const { createTask } = require('./backend/controllers/taskController');
const { User, Employee, Leave, Task, sequelize } = require('./backend/models');
const { Op } = require('sequelize');

async function runTests() {
    try {
        await sequelize.authenticate();
        console.log('--- HR Restrictions Verification ---');

        // 1. Setup Test Data
        // Find or create an HR user and an Admin user
        let adminUser = await User.findOne({ where: { role: 'Admin' } });
        let hrUser1 = await User.findOne({ where: { role: 'HR' } });
        let hrUser2 = await User.findOne({ where: { role: 'HR', id: { [Op.ne]: hrUser1?.id || '' } } });
        let normalUser = await User.findOne({ where: { role: 'Employee' } });

        if (!adminUser || !hrUser1 || !hrUser2 || !normalUser) {
            console.log('Requirement: Need at least 1 Admin, 2 HR, and 1 Employee in DB for full test.');
            return;
        }

        console.log(`Admin: ${adminUser.email}`);
        console.log(`HR 1: ${hrUser1.email}`);
        console.log(`HR 2: ${hrUser2.email}`);
        console.log(`Employee: ${normalUser.email}`);

        // 2. Test getAllLeaves filtering
        console.log('\n--- Testing getAllLeaves filtering ---');
        const mockRes = {
            json: (data) => console.log(`   Count: ${data.length} leaves returned`),
            status: (code) => ({ json: (data) => console.log(`   Error ${code}: ${data.error}`) })
        };

        console.log('HR 1 fetching all leaves:');
        await getAllLeaves({ user: { id: hrUser1.id, role: 'HR' } }, mockRes);
        
        console.log('Admin fetching all leaves:');
        await getAllLeaves({ user: { id: adminUser.id, role: 'Admin' } }, mockRes);

        // 3. Test updateLeaveStatus restriction
        console.log('\n--- Testing updateLeaveStatus restriction ---');
        // Find a leave request by HR 2
        let hr2Leave = await Leave.findOne({ where: { userId: hrUser2.id } });
        if (!hr2Leave) {
            console.log('   Creating mock leave for HR 2...');
            hr2Leave = await Leave.create({
                userId: hrUser2.id,
                employeeName: 'HR 2',
                employeeEmail: hrUser2.email,
                leaveType: 'Annual Leave',
                fromDate: '2026-04-01',
                toDate: '2026-04-02',
                days: 2,
                reason: 'Test',
                status: 'Pending'
            });
        }

        console.log('HR 1 trying to approve HR 2 leave:');
        await updateLeaveStatus({
            params: { id: hr2Leave.id },
            body: { status: 'Approved' },
            user: { id: hrUser1.id, role: 'HR' }
        }, mockRes);

        console.log('Admin trying to approve HR 2 leave:');
        await updateLeaveStatus({
            params: { id: hr2Leave.id },
            body: { status: 'Approved' },
            user: { id: adminUser.id, role: 'Admin' }
        }, mockRes);

        // 4. Test createTask restriction
        console.log('\n--- Testing createTask restriction ---');
        console.log('HR 1 trying to assign task to HR 2:');
        await createTask({
            body: { title: 'HR Task', assignedTo: hrUser2.id },
            user: { id: hrUser1.id, role: 'HR' }
        }, mockRes);

        console.log('HR 1 trying to assign task to themselves:');
        await createTask({
            body: { title: 'Self Task' }, // userId defaults to req.user.id
            user: { id: hrUser1.id, role: 'HR' }
        }, mockRes);

        console.log('Admin assigning task to HR 1:');
        await createTask({
            body: { title: 'Admin Given Task', assignedTo: hrUser1.id },
            user: { id: adminUser.id, role: 'Admin' }
        }, mockRes);

    } catch (err) {
        console.error('Test script error:', err);
    } finally {
        await sequelize.close();
    }
}

runTests();
