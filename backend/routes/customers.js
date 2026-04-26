const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');

/**
 * GET /api/customers
 * Aggregates all orders grouped by customer_phone.
 * Returns each unique customer with:
 *   name, phone, orderCount, totalSpend,
 *   firstOrderAt, lastOrderAt, orders (summary list)
 */
router.get('/', async (req, res) => {
  try {
    const allOrders = await Order.find().sort({ createdAt: -1 });

    // Group by phone
    const map = new Map();
    allOrders.forEach((order) => {
      const key = order.customer_phone;
      if (!map.has(key)) {
        map.set(key, {
          customer_name:  order.customer_name,
          customer_phone: order.customer_phone,
          orderCount:     0,
          totalSpend:     0,
          firstOrderAt:   order.createdAt,
          lastOrderAt:    order.createdAt,
          orders: [],
        });
      }
      const c = map.get(key);
      c.orderCount  += 1;
      c.totalSpend  += order.total;
      c.lastOrderAt  = order.createdAt > c.lastOrderAt  ? order.createdAt  : c.lastOrderAt;
      c.firstOrderAt = order.createdAt < c.firstOrderAt ? order.createdAt  : c.firstOrderAt;
      c.orders.push({
        _id:        order._id,
        total:      order.total,
        status:     order.status,
        createdAt:  order.createdAt,
        itemCount:  order.items.reduce((s, i) => s + i.quantity, 0),
      });
    });

    const customers = Array.from(map.values())
      .sort((a, b) => b.totalSpend - a.totalSpend); // default: highest spenders first

    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
