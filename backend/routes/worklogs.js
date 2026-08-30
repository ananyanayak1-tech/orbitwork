const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const auth = require('../middleware/auth');
const { ObjectId } = require('mongodb');

// Helper to check if user is HR or CEO
const isHRorCEO = (req, res, next) => {
  if (req.user.role === 'HR' || req.user.role === 'CEO') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. HR or CEO permissions required." });
  }
};

// @route   GET /api/worklogs
// @desc    Get work logs (Employees view their own, HR/CEO views all)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const db = getDb();
    let query = {};
    
    if (req.user.role !== 'HR' && req.user.role !== 'CEO') {
      query.userId = new ObjectId(req.user.id);
    }

    const worklogs = await db.collection('worklogs').find(query).sort({ createdAt: -1 }).toArray();
    res.json(worklogs);
  } catch (err) {
    console.error("Fetch worklogs error:", err);
    res.status(500).json({ message: "Server error fetching work logs" });
  }
});

// @route   POST /api/worklogs
// @desc    Submit a daily work log
// @access  Private
router.post('/', auth, async (req, res) => {
  const { todayWork, hours, challenges, tomorrowPlan } = req.body;

  if (!todayWork || !hours || !tomorrowPlan) {
    return res.status(400).json({ message: "Work details, hours, and tomorrow's plan are required" });
  }

  try {
    const db = getDb();

    // Fetch employeeId if not present in token
    let employeeId = req.user.employeeId;
    if (!employeeId) {
      const employee = await db.collection('employees').findOne({ userId: new ObjectId(req.user.id) });
      if (employee) {
        employeeId = employee.id;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const newLog = {
      userId: new ObjectId(req.user.id),
      employeeId: employeeId || "EMP_TEMP",
      employeeName: req.user.name,
      date: todayStr,
      todayWork,
      hours: Number(hours),
      challenges: challenges || '',
      tomorrowPlan,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('worklogs').insertOne(newLog);
    newLog._id = result.insertedId;

    res.status(201).json(newLog);
  } catch (err) {
    console.error("Create worklog error:", err);
    res.status(500).json({ message: "Server error submitting work log" });
  }
});

module.exports = router;
