const express  = require('express');
const router   = express.Router();
const Category = require('../models/Category');

// GET /api/categories — list all sorted by name
router.get('/', async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories — create new category
router.post('/', async (req, res) => {
  try {
    const cat = new Category({ name: req.body.name });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    // Duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Category already exists.' });
    }
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id — remove category
router.delete('/:id', async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
