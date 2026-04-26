const express  = require('express');
const router   = express.Router();
const Feedback = require('../models/Feedback');

// POST /api/feedback  — customer submits feedback
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_phone, rating, message } = req.body;
    const feedback = new Feedback({ customer_name, customer_phone, rating, message });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/feedback  — admin lists all feedback, newest first
router.get('/', async (req, res) => {
  try {
    const items = await Feedback.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/feedback/:id  — admin removes a feedback entry
router.delete('/:id', async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
