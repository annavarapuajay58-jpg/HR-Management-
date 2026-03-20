const { User, Employee, Project, TeamInvitation, ProjectIdea } = require('../models');
const fs = require('fs');
const path = require('path');

const logToFile = (msg) => {
    const logPath = path.join(__dirname, '../debug.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
};

// ─── Team Lead: Get all employees to invite ────────────────────────────────
const getAllEmployees = async (req, res) => {
    try {
        const users = await User.find({
            role: { $in: ['Employee', 'Teamlead', 'HR'] }
        }).select('_id email role firstName lastName');

        const userIds = users.map(u => u._id);
        const employeeProfiles = await Employee.find({ userId: { $in: userIds } });
        
        // Map profiles by userId for quick lookup
        const profileMap = {};
        employeeProfiles.forEach(ep => {
            profileMap[ep.userId.toString()] = ep;
        });

        const result = users.map(u => {
            const ep = profileMap[u._id.toString()];
            return {
                id: u._id,
                email: u.email,
                name: (u.firstName && u.firstName !== 'N/A') 
                    ? `${u.firstName} ${u.lastName || ''}`.trim()
                    : ep && ep.firstName 
                        ? `${ep.firstName} ${ep.lastName || ''}`.trim()
                        : u.email.split('@')[0],
                designation: ep?.designation || u.role
            };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── Team Lead: Create project + send invitations ─────────────────────────
const createProject = async (req, res) => {
    try {
        const { name, description, deadline, employeeIds } = req.body;
        const teamLeadId = req.user.id;

        if (!name || !description || !employeeIds || employeeIds.length === 0) {
            return res.status(400).json({ error: 'Project name, description, and at least one employee are required.' });
        }

        // Get team lead's name
        const lead = await User.findById(teamLeadId);
        const leadProfile = await Employee.findOne({ userId: teamLeadId });
        const teamLeadName = leadProfile && leadProfile.firstName
            ? `${leadProfile.firstName} ${leadProfile.lastName}`.trim()
            : lead.email.split('@')[0];

        // Create the project
        const project = new Project({ teamLeadId, teamLeadName, name, description, deadline: deadline || null });
        await project.save();

        // Send invitations to each selected employee
        const employees = await User.find({ _id: { $in: employeeIds } });
        const profiles = await Employee.find({ userId: { $in: employeeIds } });
        
        const profileMap = {};
        profiles.forEach(ep => {
            profileMap[ep.userId.toString()] = ep;
        });

        const invitations = employees.map(emp => {
            const ep = profileMap[emp._id.toString()];
            return {
                projectId: project._id,
                teamLeadId,
                employeeId: emp._id,
                employeeName: ep && ep.firstName
                    ? `${ep.firstName} ${ep.lastName}`.trim()
                    : emp.email.split('@')[0],
                employeeEmail: emp.email,
                status: 'Pending'
            };
        });

        await TeamInvitation.insertMany(invitations);

        res.status(201).json({ message: 'Project created and invitations sent.', project });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ─── Team Lead: View own projects with member statuses ────────────────────
const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ teamLeadId: req.user.id }).sort({ createdAt: -1 }).lean();
        
        const projectIds = projects.map(p => p._id);
        const invitations = await TeamInvitation.find({ projectId: { $in: projectIds } }).lean();
        const ideas = await ProjectIdea.find({ projectId: { $in: projectIds } }).lean();

        const result = projects.map(project => ({
            ...project,
            id: project._id,
            TeamInvitations: invitations.filter(i => i.projectId.toString() === project._id.toString()).map(i => ({ ...i, id: i._id })),
            ProjectIdeas: ideas.filter(i => i.projectId.toString() === project._id.toString()).map(i => ({ ...i, id: i._id }))
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── Employee: View own invitations ───────────────────────────────────────
const getMyInvitations = async (req, res) => {
    try {
        logToFile(`getMyInvitations called for user: ${JSON.stringify(req.user)}`);
        const invitations = await TeamInvitation.find({ employeeId: req.user.id })
            .populate({
                path: 'projectId',
                select: 'name description deadline status teamLeadName'
            })
            .sort({ createdAt: -1 })
            .lean();

        logToFile(`Found ${invitations.length} invitations for user ID: ${req.user.id}`);
        if (invitations.length > 0) {
            logToFile(`Sample invitation employeeId: ${invitations[0].employeeId}`);
        }

        // Need to fetch ideas for each project manually since projectIdea doesn't have a direct ref to invitation
        const projectIds = invitations.map(inv => inv.projectId?._id).filter(id => id);
        const ideas = await ProjectIdea.find({ projectId: { $in: projectIds } }).select('authorName authorRole idea createdAt projectId').lean();

        const result = invitations.map(inv => {
            const project = inv.projectId;
            if (project) {
                project.id = project._id;
                project.ProjectIdeas = ideas.filter(idea => idea.projectId.toString() === project._id.toString()).map(i => ({ ...i, id: i._id }));
                inv.Project = project;
            }
            inv.id = inv._id;
            return inv;
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── Employee: Respond to invitation ──────────────────────────────────────
const respondToInvitation = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be Accepted or Rejected' });
        }

        const invitation = await TeamInvitation.findOne({ _id: id, employeeId: req.user.id });

        if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
        if (invitation.status !== 'Pending') {
            return res.status(400).json({ error: 'Invitation already responded to' });
        }

        invitation.status = status;
        await invitation.save();

        res.json({ message: `Invitation ${status.toLowerCase()} successfully.`, invitation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── Any member: Post an idea ─────────────────────────────────────────────
const postIdea = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const { idea } = req.body;
        const authorId = req.user.id;

        if (!idea || !idea.trim()) {
            return res.status(400).json({ error: 'Idea cannot be empty' });
        }

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const isTeamLead = project.teamLeadId.toString() === authorId.toString();
        const isMember = await TeamInvitation.findOne({
            projectId, employeeId: authorId, status: 'Accepted'
        });

        if (!isTeamLead && !isMember) {
            return res.status(403).json({ error: 'You are not a member of this project' });
        }

        const author = await User.findById(authorId);
        const authorProfile = await Employee.findOne({ userId: authorId });
        const authorName = authorProfile && authorProfile.firstName
            ? `${authorProfile.firstName} ${authorProfile.lastName}`.trim()
            : author.email.split('@')[0];

        const newIdea = new ProjectIdea({
            projectId,
            authorId,
            authorName,
            authorRole: req.user.role,
            idea: idea.trim()
        });
        await newIdea.save();

        res.status(201).json(newIdea);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── Any member: Get all ideas for a project ──────────────────────────────
const getIdeas = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const ideas = await ProjectIdea.find({ projectId }).sort({ createdAt: -1 });
        res.json(ideas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─── HR/Admin: Get ALL projects across all team leads ─────────────────────
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 }).lean();
        
        const projectIds = projects.map(p => p._id);
        const invitations = await TeamInvitation.find({ projectId: { $in: projectIds } }).select('employeeId employeeName employeeEmail status projectId').lean();
        const ideas = await ProjectIdea.find({ projectId: { $in: projectIds } }).select('authorName authorRole idea createdAt projectId').lean();

        const result = projects.map(project => ({
            ...project,
            id: project._id,
            TeamInvitations: invitations.filter(i => i.projectId.toString() === project._id.toString()).map(i => ({ ...i, id: i._id })),
            ProjectIdeas: ideas.filter(i => i.projectId.toString() === project._id.toString()).map(i => ({ ...i, id: i._id }))
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllEmployees,
    getAllProjects,
    createProject,
    getMyProjects,
    getMyInvitations,
    respondToInvitation,
    postIdea,
    getIdeas
};
