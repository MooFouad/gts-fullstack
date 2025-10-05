const express = require('express');
const router = express.Router();
const Electricity = require('../models/Electricity');

// Add test electricity data
router.post('/add-electricity', async (req, res) => {
    try {
        const testData = {
            departmentNumber: "DEPT-001",
            meterNumber: "MTR-2023-001",
            location: "Main Building",
            lastReadingDate: "2025-10-01",
            currentReading: 5000,
            previousReading: 4500,
            consumption: 500,
            billAmount: 750.00,
            billDate: "2025-10-02",
            dueDate: "2025-10-25",
            paymentStatus: "Pending",
            propertyType: "Commercial",
            subscriberName: "GTS Company",
            subscriberNumber: "SUB-001",
            notes: "Test data entry",
            attachments: [],
            alertThreshold: 600
        };

        const electricity = new Electricity(testData);
        await electricity.save();
        
        res.status(201).json({
            message: "Test data added successfully",
            data: electricity
        });
    } catch (error) {
        console.error('Error adding test data:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

// Add multiple test records
router.post('/add-multiple-electricity', async (req, res) => {
    try {
        const testData = [
            {
                departmentNumber: "DEPT-002",
                meterNumber: "MTR-2023-002",
                location: "Branch Office",
                lastReadingDate: "2025-10-01",
                currentReading: 3000,
                previousReading: 2800,
                consumption: 200,
                billAmount: 300.00,
                billDate: "2025-10-02",
                dueDate: "2025-10-25",
                paymentStatus: "Pending",
                propertyType: "Commercial",
                subscriberName: "GTS Branch",
                subscriberNumber: "SUB-002",
                notes: "Branch office consumption",
                attachments: [],
                alertThreshold: 300
            },
            {
                departmentNumber: "DEPT-003",
                meterNumber: "MTR-2023-003",
                location: "Warehouse",
                lastReadingDate: "2025-10-01",
                currentReading: 8000,
                previousReading: 7200,
                consumption: 800,
                billAmount: 1200.00,
                billDate: "2025-10-02",
                dueDate: "2025-10-25",
                paymentStatus: "Pending",
                propertyType: "Industrial",
                subscriberName: "GTS Warehouse",
                subscriberNumber: "SUB-003",
                notes: "Warehouse facility",
                attachments: [],
                alertThreshold: 1000
            }
        ];

        const result = await Electricity.insertMany(testData);
        
        res.status(201).json({
            message: "Multiple test records added successfully",
            count: result.length,
            data: result
        });
    } catch (error) {
        console.error('Error adding multiple test records:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;