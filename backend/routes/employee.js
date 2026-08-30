const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const auth = require('../middleware/auth');
const { ObjectId } = require('mongodb');

// @route   GET /api/employee/wellness
// @desc    Get user wellness logs
// @access  Private
router.get('/wellness', auth, async (req, res) => {
  try {
    const db = getDb();
    const logs = await db.collection('wellness')
      .find({ userId: req.user.id })
      .sort({ date: -1 })
      .toArray();
    res.json(logs);
  } catch (err) {
    console.error("Fetch wellness logs error:", err);
    res.status(500).json({ message: "Server error fetching wellness logs" });
  }
});

// @route   POST /api/employee/wellness
// @desc    Create a wellness mood log
// @access  Private
router.post('/wellness', auth, async (req, res) => {
  const { score, mood, energy, note } = req.body;

  if (score === undefined || !mood) {
    return res.status(400).json({ message: "Mood score and status are required" });
  }

  try {
    const db = getDb();
    const newLog = {
      userId: req.user.id,
      score: Number(score),
      mood,
      energy: Number(energy || 5),
      note: note || '',
      date: new Date().toISOString().split('T')[0]
    };

    const result = await db.collection('wellness').insertOne(newLog);
    newLog._id = result.insertedId;

    res.status(201).json(newLog);
  } catch (err) {
    console.error("Create wellness log error:", err);
    res.status(500).json({ message: "Server error saving wellness log" });
  }
});

// @route   GET /api/employee/kudos
// @desc    Get peer kudos wall cards
// @access  Private
router.get('/kudos', auth, async (req, res) => {
  try {
    const db = getDb();
    const kudos = await db.collection('kudos')
      .find()
      .sort({ date: -1 })
      .toArray();
    res.json(kudos);
  } catch (err) {
    console.error("Fetch kudos error:", err);
    res.status(500).json({ message: "Server error fetching kudos" });
  }
});

// @route   POST /api/employee/kudos
// @desc    Post a kudos appreciation card to a peer
// @access  Private
router.post('/kudos', auth, async (req, res) => {
  const { recipientId, recipientName, message, badge } = req.body;

  if (!recipientId || !recipientName || !message || !badge) {
    return res.status(400).json({ message: "Recipient details, message, and badge category are required" });
  }

  try {
    const db = getDb();
    
    // Get sender's name from database
    const sender = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    const senderName = sender ? sender.name : 'Teammate';

    const newKudos = {
      senderId: req.user.id,
      senderName,
      recipientId,
      recipientName,
      message,
      badge,
      date: new Date().toISOString().split('T')[0]
    };

    const result = await db.collection('kudos').insertOne(newKudos);
    newKudos._id = result.insertedId;

    res.status(201).json(newKudos);
  } catch (err) {
    console.error("Create kudos error:", err);
    res.status(500).json({ message: "Server error posting kudos card" });
  }
});

module.exports = router;
