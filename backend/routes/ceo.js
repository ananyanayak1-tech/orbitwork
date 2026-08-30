const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const auth = require('../middleware/auth');
const { ObjectId } = require('mongodb');

// Helper to check if user is CEO
const isCEO = (req, res, next) => {
  const role = (req.user.role || '').toUpperCase();
  if (role === 'CEO') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. CEO permissions required." });
  }
};

// Helper to check if task status is completed
const isCompleted = (status) => {
  const s = (status || '').toLowerCase();
  return s === 'completed' || s === 'done';
};

// @route   GET /api/ceo/insights
// @desc    Get AI Burnout and Productivity Insights for CEO
// @access  Private (CEO only)
router.get('/insights', auth, isCEO, async (req, res) => {
  try {
    const db = getDb();
    
    // Fetch all active employees
    const employees = await db.collection('employees').find({ status: 'Active' }).toArray();
    // Fetch all tasks
    const tasks = await db.collection('tasks').find().toArray();
    // Fetch users and wellness logs to check employee mental well-being
    const users = await db.collection('users').find().toArray();
    const wellnessLogs = await db.collection('wellness').find().toArray();

    // Map user emails to their latest wellness entry
    const userWellnessMap = {};
    users.forEach(u => {
      if (u.email) {
        const userLogs = wellnessLogs.filter(w => w.userId === u._id.toString());
        if (userLogs.length > 0) {
          // Sort by date descending
          userLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
          userWellnessMap[u.email.toLowerCase()] = userLogs[0];
        }
      }
    });

    // Fetch recent attendance logs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];
    
    const attendanceRecords = await db.collection('attendance')
      .find({ date: { $gte: dateStr } })
      .toArray();

    // 1. Burnout & Load analysis
    const burnoutAlerts = employees.map(emp => {
      // Find active tasks assigned to employee
      const activeTasks = tasks.filter(t => 
        t.assignedTo && 
        t.assignedTo.includes(emp.id) && 
        !isCompleted(t.status)
      );
      
      const highPriorityCount = activeTasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length;
      
      // Calculate avg work hours from recent attendance
      const empAttendance = attendanceRecords.filter(a => a.employeeId === emp.id && a.checkIn && a.checkOut);
      let avgHours = 0;
      if (empAttendance.length > 0) {
        let totalMs = 0;
        empAttendance.forEach(a => {
          const inTime = new Date(a.checkIn.includes('T') ? a.checkIn : `${a.date}T${a.checkIn}:00Z`);
          const outTime = new Date(a.checkOut.includes('T') ? a.checkOut : `${a.date}T${a.checkOut}:00Z`);
          if (!isNaN(inTime) && !isNaN(outTime)) {
            totalMs += (outTime - inTime);
          }
        });
        avgHours = (totalMs / empAttendance.length) / (1000 * 60 * 60);
      } else {
        avgHours = 8.0; // standard baseline fallback
      }

      // Burnout condition:
      // - Active tasks > 3 AND highPriorityCount >= 2
      // - OR average daily work hours > 9.5
      let riskScore = 0;
      let reasons = [];
      if (activeTasks.length > 3) {
        riskScore += 30;
        reasons.push(`${activeTasks.length} active tasks`);
      }
      if (highPriorityCount >= 2) {
        riskScore += 40;
        reasons.push(`${highPriorityCount} high/critical priority tasks`);
      }
       if (avgHours > 9.5) {
        riskScore += 30;
        reasons.push(`Averages ${avgHours.toFixed(1)} hrs/day`);
      }

      // Check self-reported wellness mood and index score
      const latestWellness = userWellnessMap[emp.email?.toLowerCase()];
      if (latestWellness) {
        const wellnessMood = latestWellness.mood || '';
        const wellnessScore = latestWellness.score;
        if (wellnessMood === 'Overwhelmed') {
          riskScore += 50;
          reasons.push(`Self-reported Overwhelmed mood`);
        } else if (wellnessMood === 'Stressed') {
          riskScore += 30;
          reasons.push(`Self-reported Stressed mood`);
        }
        
        if (wellnessScore <= 4) {
          riskScore += 30;
          reasons.push(`Low wellness index: ${wellnessScore}/10`);
        }
        
        if (latestWellness.note && latestWellness.note.trim() && (wellnessMood === 'Overwhelmed' || wellnessMood === 'Stressed' || wellnessScore <= 4)) {
          reasons.push(`Note: "${latestWellness.note.trim()}"`);
        }
      }

      let riskLevel = 'Low';
      if (riskScore >= 70) riskLevel = 'Critical';
      else if (riskScore >= 40) riskLevel = 'Medium';

      return {
        employeeId: emp.id,
        name: emp.name,
        designation: emp.designation,
        activeTasksCount: activeTasks.length,
        highPriorityCount,
        avgHours: parseFloat(avgHours.toFixed(1)),
        riskLevel,
        reasons
      };
    }).filter(a => a.riskLevel !== 'Low'); // Return medium/critical alerts

    // 2. Productivity metrics
    const overallTaskCount = tasks.length;
    const completedTasksCount = tasks.filter(t => isCompleted(t.status)).length;
    const completionRate = overallTaskCount > 0 ? (completedTasksCount / overallTaskCount) * 100 : 0;

    // Leaderboard by completion count
    const leaderboard = employees.map(emp => {
      const empCompletedTasks = tasks.filter(t => 
        t.assignedTo && 
        t.assignedTo.includes(emp.id) && 
        isCompleted(t.status)
      ).length;

      const empTotalTasks = tasks.filter(t => 
        t.assignedTo && 
        t.assignedTo.includes(emp.id)
      ).length;

      return {
        name: emp.name,
        id: emp.id,
        designation: emp.designation,
        completed: empCompletedTasks,
        total: empTotalTasks,
        ratio: empTotalTasks > 0 ? parseFloat(((empCompletedTasks / empTotalTasks) * 100).toFixed(0)) : 0
      };
    }).sort((a, b) => b.completed - a.completed).slice(0, 5);

    // 3. Task Velocity
    const completedTasks = tasks.filter(t => isCompleted(t.status) && t.startDate && t.deadline);
    let avgDaysToComplete = 4.2; // default target
    if (completedTasks.length > 0) {
      let totalDays = 0;
      completedTasks.forEach(t => {
        const start = new Date(t.startDate);
        const end = new Date(t.deadline);
        if (!isNaN(start) && !isNaN(end)) {
          totalDays += (end - start) / (1000 * 60 * 60 * 24);
        }
      });
      avgDaysToComplete = parseFloat((totalDays / completedTasks.length).toFixed(1));
    }

    res.json({
      burnoutAlerts,
      overallStats: {
        completionRate: parseFloat(completionRate.toFixed(1)),
        avgDaysToComplete
      },
      leaderboard
    });
  } catch (err) {
    console.error("Insights API error:", err);
    res.status(500).json({ message: "Server error generating insights" });
  }
});

// @route   GET /api/ceo/okrs
// @desc    Get all company Objectives & Key Results (OKRs)
// @access  Private (CEO only)
router.get('/okrs', auth, isCEO, async (req, res) => {
  try {
    const db = getDb();
    const okrs = await db.collection('okrs').find().toArray();
    res.json(okrs);
  } catch (err) {
    console.error("Fetch OKRs error:", err);
    res.status(500).json({ message: "Server error fetching OKRs" });
  }
});

// @route   POST /api/ceo/okrs
// @desc    Create a new company Objective
// @access  Private (CEO only)
router.post('/okrs', auth, isCEO, async (req, res) => {
  const { objective, department, target, keyResults } = req.body;

  if (!objective) {
    return res.status(400).json({ message: "Objective text is required" });
  }

  try {
    const db = getDb();
    const krs = (keyResults || []).map(text => ({
      text,
      progress: 0
    }));

    const newOkr = {
      objective,
      department: department || 'All Departments',
      target: target || 'Q3 2026',
      progress: 0,
      keyResults: krs,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('okrs').insertOne(newOkr);
    newOkr._id = result.insertedId;

    res.status(201).json(newOkr);
  } catch (err) {
    console.error("Create OKR error:", err);
    res.status(500).json({ message: "Server error creating OKR" });
  }
});

// @route   PUT /api/ceo/okrs/:id
// @desc    Update progress of an Objective or its Key Results
// @access  Private (CEO only)
router.put('/okrs/:id', auth, isCEO, async (req, res) => {
  const okrId = req.params.id;
  const { progress, keyResults } = req.body;

  if (!ObjectId.isValid(okrId)) {
    return res.status(400).json({ message: "Invalid OKR ID format" });
  }

  try {
    const db = getDb();
    const updates = {};
    if (progress !== undefined) updates.progress = progress;
    if (keyResults !== undefined) updates.keyResults = keyResults;

    await db.collection('okrs').updateOne(
      { _id: new ObjectId(okrId) },
      { $set: updates }
    );

    const updatedOkr = await db.collection('okrs').findOne({ _id: new ObjectId(okrId) });
    res.json(updatedOkr);
  } catch (err) {
    console.error("Update OKR error:", err);
    res.status(500).json({ message: "Server error updating OKR" });
  }
});

module.exports = router;
