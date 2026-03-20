const { getAllLeaves, updateLeaveStatus } = require('./controllers/leaveController');
const { createTask } = require('./controllers/taskController');
const { User, Employee, Leave, Task, sequelize } = require('./models');
const { Op } = require('sequelize');
const fs = require('fs');

async function runTests() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        await sequelize.authenticate();
        log('--- HR Restrictions Verification ---');

        // 1. Ensure we have the necessary users
        let adminUser = await User.findOne({ where: { role: 'Admin' } });
        let hrUser1 = await User.findOne({ where: { role: 'HR' } });
        let normalUser = await User.findOne({ where: { role: 'Employee' } });

        if (!adminUser || !hrUser1 || !normalUser) {
            log('Requirement: Need at least 1 Admin, 1 HR, and 1 Employee in DB.');
            return;
        }

        // Create a temporary second HR user for testing
        let hrUser2 = await User.findOne({ where: { role: 'HR', email: 'tmp_hr_test@example.com' } });
        if (!hrUser2) {
            log('Creating temporary HR user for testing...');
            hrUser2 = await User.create({
                firstName: 'Test',
                lastName: 'HR',
                email: 'tmp_hr_test@example.com',
                password: 'password123',
                role: 'HR',
                employeeId: 'HR_TEST_99'
            });
        }

        log(`Admin: ${adminUser.email}`);
        log(`HR 1: ${hrUser1.email}`);
        log(`HR 2: ${hrUser2.email}`);
        log(`Employee: ${normalUser.email}`);

        const mockRes = {
            json: (data) => log(`   OK: ${JSON.stringify(data).substring(0, 80)}...`),
            status: (code) => {
                const inner = { json: (data) => log(`   Expected Restriction (${code}): ${data.error || JSON.stringify(data)}`) };
                return inner;
            }
        };

        // 2. Test getAllLeaves filtering
        log('\n--- 2. Testing getAllLeaves filtering ---');
        log('HR 1 fetching all leaves:');
        await getAllLeaves({ user: { id: hrUser1.id, role: 'HR' } }, {
            json: (data) => {
                const hrLeavesCount = data.filter(l => l.User && l.User.role === 'HR').length;
                log(`   Returned ${data.length} leaves. HR leaves count: ${hrLeavesCount}`);
            },
            status: (code) => ({ json: (data) => log(`   Error ${code}: ${data.error}`) })
        });
        
        log('Admin fetching all leaves:');
        await getAllLeaves({ user: { id: adminUser.id, role: 'Admin' } }, {
            json: (data) => {
                const hrLeavesCount = data.filter(l => l.User && l.User.role === 'HR').length;
                log(`   Returned ${data.length} leaves. HR leaves count: ${hrLeavesCount}`);
            }
        });

        // 3. Test updateLeaveStatus restriction
        log('\n--- 3. Testing updateLeaveStatus restriction ---');
        let hr2Leave = await Leave.findOne({ where: { userId: hrUser2.id } });
        if (!hr2Leave) {
            log('   Creating mock leave for HR 2...');
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

        log('HR 1 trying to approve HR 2 leave:');
        await updateLeaveStatus({
            params: { id: hr2Leave.id },
            body: { status: 'Approved' },
            user: { id: hrUser1.id, role: 'HR' }
        }, mockRes);

        log('Admin trying to approve HR 2 leave:');
        await updateLeaveStatus({
            params: { id: hr2Leave.id },
            body: { status: 'Approved' },
            user: { id: adminUser.id, role: 'Admin' }
        }, mockRes);

        // 4. Test createTask restriction
        log('\n--- 4. Testing createTask restriction ---');
        const taskDue = '2026-12-31';
        
        log('HR 1 trying to assign task to HR 2:');
        await createTask({
            body: { title: 'HR Task', assignedTo: hrUser2.id, due: taskDue },
            user: { id: hrUser1.id, role: 'HR' }
        }, mockRes);

        log('HR 1 trying to assign task to themselves:');
        await createTask({
            body: { title: 'Self Task', due: taskDue }, // userId defaults to req.user.id
            user: { id: hrUser1.id, role: 'HR' }
        }, mockRes);

        log('Admin assigning task to HR 1:');
        await createTask({
            body: { title: 'Admin Given Task', assignedTo: hrUser1.id, due: taskDue },
            user: { id: adminUser.id, role: 'Admin' }
        }, mockRes);

        // Cleanup temporary data
        log('\nCleaning up temporary test data...');
        await Leave.destroy({ where: { userId: hrUser2.id } });
        await User.destroy({ where: { email: 'tmp_hr_test@example.com' } });

    } catch (err) {
        log('Test script error: ' + err.stack);
    } finally {
        fs.writeFileSync('test_results.txt', output);
        await sequelize.close();
    }
}

runTests();
