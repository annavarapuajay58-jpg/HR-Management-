const { getEmployeesWithSalaries } = require('./backend/controllers/payrollController');

async function testController() {
    const req = {};
    const res = {
        json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2)),
        status: (code) => {
            console.log('Response Status:', code);
            return res;
        }
    };

    try {
        await getEmployeesWithSalaries(req, res);
    } catch (err) {
        console.error('Controller execution failed:', err);
    }
}

testController();
