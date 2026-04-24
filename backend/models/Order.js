const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food_item_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
  name:          { type: String, required: true },
  quantity:      { type: Number, required: true, min: 1 },
  price_at_time: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    customer_name:  { type: String, required: true, trim: true },
    customer_phone: { type: String, required: true, trim: true },
    total:          { type: Number, required: true, min: 0 },
    status: {
      type:    String,
      enum:    ['pending', 'accepted', 'preparing', 'ready'],
      default: 'pending',
    },
    payment_done:  { type: Boolean, default: false },
    whatsapp_link: { type: String,  default: '' },
    items:         [orderItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
