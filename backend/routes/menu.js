const express  = require('express');
const router   = express.Router();
const FoodItem = require('../models/FoodItem');

// GET /api/menu  — optionally filter by ?is_available=true
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.is_available !== undefined) {
      filter.is_available = req.query.is_available === 'true';
    }
    const items = await FoodItem.find(filter).sort({ category: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/menu  — create new food item
router.post('/', async (req, res) => {
  try {
    const item = new FoodItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/menu/:id  — update food item
router.put('/:id', async (req, res) => {
  try {
    const item = await FoodItem.findByIdAndUpdate(req.params.id, req.body, {
      new:          true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/menu/:id  — remove food item
router.delete('/:id', async (req, res) => {
  try {
    const item = await FoodItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    res.json({ message: 'Item deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
