const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');

// GET /api/orders  — list all orders newest first
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders  — create order + emit 'new_order' via Socket.io
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    const io = req.app.get('io');
    io.emit('new_order', order);

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status  — update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const io = req.app.get('io');
    io.emit('order_updated', order);

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/payment  — toggle payment_done
router.patch('/:id/payment', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    order.payment_done = !order.payment_done;
    await order.save();

    const io = req.app.get('io');
    io.emit('order_updated', order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
