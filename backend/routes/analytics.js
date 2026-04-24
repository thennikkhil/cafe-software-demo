const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');

// GET /api/analytics  — today's summary
router.get('/', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({ createdAt: { $gte: startOfDay } });

    const totalRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount   = todayOrders.length;

    // Tally item quantities across all today's orders
    const itemCounts = {};
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const sorted = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
    const mostPopularItem = sorted.length
      ? { name: sorted[0][0], count: sorted[0][1] }
      : null;

    res.json({ totalRevenue, orderCount, mostPopularItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
