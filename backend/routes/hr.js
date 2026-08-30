const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const auth = require('../middleware/auth');
const { ObjectId } = require('mongodb');

// Helper to check if user is HR or CEO
const isHRorCEO = (req, res, next) => {
  const role = (req.user.role || '').toUpperCase();
  if (role === 'HR' || role === 'CEO') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. HR or CEO permissions required." });
  }
};

// @route   GET /api/hr/candidates
// @desc    Get all recruitment candidates
// @access  Private (HR/CEO only)
router.get('/candidates', auth, isHRorCEO, async (req, res) => {
  try {
    const db = getDb();
    const candidates = await db.collection('candidates').find().toArray();
    res.json(candidates);
  } catch (err) {
    console.error("Fetch candidates error:", err);
    res.status(500).json({ message: "Server error fetching candidates" });
  }
});

// @route   POST /api/hr/candidates
// @desc    Create a candidate profile
// @access  Private (HR/CEO only)
router.post('/candidates', auth, isHRorCEO, async (req, res) => {
  const { name, email, skills, stage, resumeName } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Candidate name and email are required" });
  }

  try {
    const db = getDb();
    const newCandidate = {
      name,
      email,
      skills: Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim()).filter(Boolean),
      stage: stage || 'Applied',
      resumeName: resumeName || 'Uploaded_Resume.pdf',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    const result = await db.collection('candidates').insertOne(newCandidate);
    newCandidate._id = result.insertedId;

    res.status(201).json(newCandidate);
  } catch (err) {
    console.error("Create candidate error:", err);
    res.status(500).json({ message: "Server error creating candidate" });
  }
});

// @route   PUT /api/hr/candidates/:id
// @desc    Update candidate details/stage
// @access  Private (HR/CEO only)
router.put('/candidates/:id', auth, isHRorCEO, async (req, res) => {
  const candidateId = req.params.id;
  const { name, email, skills, stage, resumeName } = req.body;

  if (!ObjectId.isValid(candidateId)) {
    return res.status(400).json({ message: "Invalid Candidate ID format" });
  }

  try {
    const db = getDb();
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (stage !== undefined) updates.stage = stage;
    if (resumeName !== undefined) updates.resumeName = resumeName;
    if (skills !== undefined) {
      updates.skills = Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim()).filter(Boolean);
    }

    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      { $set: updates }
    );

    const updatedCandidate = await db.collection('candidates').findOne({ _id: new ObjectId(candidateId) });
    res.json(updatedCandidate);
  } catch (err) {
    console.error("Update candidate error:", err);
    res.status(500).json({ message: "Server error updating candidate" });
  }
});

// @route   DELETE /api/hr/candidates/:id
// @desc    Delete a candidate
// @access  Private (HR/CEO only)
router.delete('/candidates/:id', auth, isHRorCEO, async (req, res) => {
  const candidateId = req.params.id;

  if (!ObjectId.isValid(candidateId)) {
    return res.status(400).json({ message: "Invalid Candidate ID format" });
  }

  try {
    const db = getDb();
    await db.collection('candidates').deleteOne({ _id: new ObjectId(candidateId) });
    res.json({ message: "Candidate deleted successfully" });
  } catch (err) {
    console.error("Delete candidate error:", err);
    res.status(500).json({ message: "Server error deleting candidate" });
  }
});

module.exports = router;
