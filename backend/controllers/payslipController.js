const { Salary, Employee, User } = require('../models');
const PDFDocument = require('pdfkit');
const archiver = require('archiver');
const { Readable } = require('stream');

// @desc    Get personal payslips
// @route   GET /api/payslips/my
// @access  Private (Self)
exports.getMyPayslips = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) {
            return res.status(404).json({ error: 'Employee profile not found' });
        }

        const { year, month } = req.query;
        let query = { employeeId: employee._id };
        
        if (year) query.year = parseInt(year);
        if (month) query.month = month;

        const payslips = await Salary.find(query).sort({ year: -1, createdAt: -1 });
        res.json(payslips);
    } catch (error) {
        console.error('Get my payslips error:', error);
        res.status(500).json({ error: 'Server error while fetching payslips' });
    }
};

// Internal function to generate PDF
const generatePayslipPDF = (doc, salary, employee) => {
    // Add Header
    doc.fontSize(20).text('PAYSLIP', { align: 'center', underline: true });
    doc.moveDown();

    // Company Info (Placeholder)
    doc.fontSize(14).text('Nova HamoTech', { align: 'center' });
    doc.fontSize(10).text('Building Excellence through Technology', { align: 'center' });
    doc.moveDown();

    // Employee Details
    doc.fontSize(12).text(`Employee Name: ${employee.firstName} ${employee.lastName}`);
    doc.text(`Employee ID: ${req.user.employeeId}`); // Note: pass req or user to this if needed
    doc.text(`Department: ${employee.department}`);
    doc.text(`Designation: ${employee.designation}`);
    doc.moveDown();

    // Period Details
    doc.fontSize(12).text(`Month: ${salary.month}`, { continued: true }).text(`   Year: ${salary.year}`, { align: 'right' });
    doc.moveDown();

    // Table Header
    const tableTop = doc.y;
    doc.lineJoin('butt').rect(50, tableTop, 500, 20).stroke();
    doc.text('Description', 60, tableTop + 5);
    doc.text('Amount (INR)', 400, tableTop + 5);

    // Table Content
    let currentY = tableTop + 25;
    
    const row = (desc, amount) => {
        doc.text(desc, 60, currentY);
        doc.text(`+ ₹ ${amount.toLocaleString()}`, 400, currentY);
        currentY += 20;
    };

    const deductionRow = (desc, amount) => {
        doc.text(desc, 60, currentY);
        doc.text(`- ₹ ${amount.toLocaleString()}`, 400, currentY);
        currentY += 20;
    };

    row('Basic Salary', salary.basicSalary);
    row('Bonus', salary.bonus);
    deductionRow('Deductions', salary.deductions);

    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    doc.fontSize(14).fillColor('#10b981').text('Net Salary', 60, currentY);
    doc.text(`₹ ${salary.netSalary.toLocaleString()}`, 400, currentY);
    doc.fillColor('black');

    doc.moveDown(4);
    doc.fontSize(10).text('This is a computer-generated document and does not require a signature.', { align: 'center', italic: true });

    return doc;
};

// Simplified PDF generation for the controller
const createPayslipPDFStream = (salary, employee, user) => {
    const doc = new PDFDocument({ margin: 50 });

    // Header
    doc.fontSize(20).fillColor('#1e293b').text('PAYSLIP', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text('Nova HamoTech', { align: 'center' });
    doc.fontSize(10).fillColor('#64748b').text('Employee Management System', { align: 'center' });
    doc.moveDown(2);

    // Draw horizontal line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown(1.5);

    // Employee & Period info
    const labelColumn = 60;
    const valueColumn = 180;
    const startY = doc.y;

    doc.fontSize(11).fillColor('#64748b').text('Employee Name:', labelColumn, startY);
    doc.fillColor('#1e293b').text(`${employee.firstName} ${employee.lastName}`, valueColumn, startY);

    doc.fillColor('#64748b').text('Employee ID:', labelColumn, startY + 20);
    doc.fillColor('#1e293b').text(user.employeeId, valueColumn, startY + 20);

    doc.fillColor('#64748b').text('Department:', labelColumn, startY + 40);
    doc.fillColor('#1e293b').text(employee.department || 'N/A', valueColumn, startY + 40);

    doc.fillColor('#64748b',).text('Period:', 350, startY);
    doc.fillColor('#1e293b').text(`${salary.month} ${salary.year}`, 420, startY);

    doc.moveDown(4);

    // Salary Breakdown Table
    doc.fontSize(12).fillColor('#1e293b').text('Earnings & Deductions', { underline: true });
    doc.moveDown();

    const tableTop = doc.y;
    doc.fontSize(11).fillColor('#64748b');
    doc.text('Description', 60, tableTop);
    doc.text('Amount', 450, tableTop, { align: 'right' });
    
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#f1f5f9').stroke();
    doc.moveDown(1);

    const addRow = (label, amount, color = '#1e293b', isNegative = false) => {
        const y = doc.y;
        doc.fillColor('#475569').text(label, 60, y);
        doc.fillColor(color).text(`${isNegative ? '-' : '+'} ₹ ${amount.toLocaleString()}`, 450, y, { align: 'right' });
        doc.moveDown(1.5);
    };

    addRow('Basic Salary', salary.basicSalary);
    addRow('Bonus', salary.bonus, '#10b981');
    addRow('Deductions', salary.deductions, '#ef4444', true);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown(1.5);

    doc.fontSize(14).fillColor('#1e293b').text('Net Salary', 60, doc.y);
    doc.fontSize(14).fillColor('#10b981').text(`₹ ${salary.netSalary.toLocaleString()}`, 450, doc.y, { align: 'right' });

    doc.moveDown(5);
    doc.fontSize(10).fillColor('#94a3b8').text('Note: This is an electronically generated document.', { align: 'center' });
    
    doc.end();
    return doc;
};

// @desc    Download single payslip PDF
// @route   GET /api/payslips/download/:id
// @access  Private (Self)
exports.downloadPayslip = async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id);
        if (!salary) return res.status(404).json({ error: 'Salary record not found' });

        const employee = await Employee.findById(salary.employeeId);
        // Security check: ensure this payslip belongs to the user
        if (employee.userId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized access to this payslip' });
        }

        const user = await User.findById(req.user.id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Payslip-${salary.month}-${salary.year}.pdf`);

        const doc = createPayslipPDFStream(salary, employee, user);
        doc.pipe(res);
    } catch (error) {
        console.error('Download payslip error:', error);
        res.status(500).json({ error: 'Server error while generating PDF' });
    }
};

// @desc    Download all payslips for a year as ZIP
// @route   GET /api/payslips/download-year/:year
// @access  Private (Self)
exports.downloadYearlyPayslips = async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const user = await User.findById(req.user.id);

        const payslips = await Salary.find({ employeeId: employee._id, year });
        if (payslips.length === 0) {
            return res.status(404).json({ error: `No payslips found for year ${year}` });
        }

        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=Payslips-${year}.zip`);

        archive.pipe(res);

        for (const salary of payslips) {
            const doc = createPayslipPDFStream(salary, employee, user);
            archive.append(doc, { name: `Payslip-${salary.month}-${year}.pdf` });
        }

        archive.finalize();
    } catch (error) {
        console.error('Download year payslips error:', error);
        res.status(500).json({ error: 'Server error while generating ZIP' });
    }
};
