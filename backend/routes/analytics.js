const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const now        = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);

    // ── Today's orders ────────────────────────────────────────────────────
    const todayOrders  = await Order.find({ createdAt: { $gte: startOfDay } });
    const totalRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount   = todayOrders.length;

    // Today's most popular item
    const todayCounts = {};
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        todayCounts[item.name] = (todayCounts[item.name] || 0) + item.quantity;
      });
    });
    const todaySorted    = Object.entries(todayCounts).sort((a, b) => b[1] - a[1]);
    const mostPopularItem = todaySorted[0] ? { name: todaySorted[0][0], count: todaySorted[0][1] } : null;

    // ── All-time item leaderboard ─────────────────────────────────────────
    const allOrders = await Order.find();
    const allItemCounts = {};
    allOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!allItemCounts[item.name]) allItemCounts[item.name] = { qty: 0, revenue: 0 };
        allItemCounts[item.name].qty     += item.quantity;
        allItemCounts[item.name].revenue += item.quantity * item.price_at_time;
      });
    });
    const topItems = Object.entries(allItemCounts)
      .map(([name, { qty, revenue }]) => ({ name, qty, revenue }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    // ── Top customers by spend ────────────────────────────────────────────
    const customerMap = {};
    allOrders.forEach((order) => {
      const key = order.customer_phone;
      if (!customerMap[key]) {
        customerMap[key] = { name: order.customer_name, phone: order.customer_phone, spend: 0, orders: 0 };
      }
      customerMap[key].spend  += order.total;
      customerMap[key].orders += 1;
    });
    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);

    // ── Daily revenue for last 7 days ─────────────────────────────────────
    const dailyRevenue = [];
    for (let d = 6; d >= 0; d--) {
      const dayStart = new Date(now); dayStart.setDate(now.getDate() - d); dayStart.setHours(0, 0, 0, 0);
      const dayEnd   = new Date(dayStart); dayEnd.setHours(23, 59, 59, 999);
      const dayOrders = allOrders.filter(o =>
        new Date(o.createdAt) >= dayStart && new Date(o.createdAt) <= dayEnd
      );
      dailyRevenue.push({
        date:    dayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        revenue: dayOrders.reduce((s, o) => s + o.total, 0),
        orders:  dayOrders.length,
      });
    }

    res.json({
      totalRevenue,
      orderCount,
      mostPopularItem,
      topItems,
      topCustomers,
      dailyRevenue,
      totalAllTimeRevenue: allOrders.reduce((s, o) => s + o.total, 0),
      totalAllTimeOrders:  allOrders.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
