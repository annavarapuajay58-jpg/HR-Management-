const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { Project, TeamInvitation, ProjectIdea, User, Employee } = require('./backend/models');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hamo_employees");
        console.log("Connected to MongoDB");

        // Simulate getMyProjects for Srivani (Teamlead)
        const srivani = await Employee.findOne({ firstName: 'Srivani', lastName: 'Seelam' });
        if (!srivani) {
            console.log("Srivani not found");
            return;
        }
        const leadId = srivani.userId;
        console.log(`Verifying for Teamlead: ${leadId}`);

        const projects = await Project.find({ teamLeadId: leadId }).lean();
        console.log(`Found ${projects.length} projects for Srivani`);
        
        for (const project of projects) {
            console.log(`Checking project: ${project.name} (${project._id})`);
            const invitations = await TeamInvitation.find({ projectId: project._id }).lean();
            const ideas = await ProjectIdea.find({ projectId: project._id }).lean();
            console.log(`  - Invitations: ${invitations.length}`);
            console.log(`  - Ideas: ${ideas.length}`);
        }

        // Simulate getMyInvitations for an employee
        const employee = await User.findOne({ role: 'Employee' });
        if (employee) {
            console.log(`Verifying invitations for Employee: ${employee._id}`);
            const invitations = await TeamInvitation.find({ employeeId: employee._id })
                .populate({
                    path: 'projectId',
                    select: 'name description deadline status teamLeadName'
                })
                .lean();
            console.log(`Found ${invitations.length} invitations`);
        }

        console.log("Verification completed successfully without errors.");
    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        await mongoose.connection.close();
    }
}

verify();
