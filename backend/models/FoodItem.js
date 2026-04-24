const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name:         { type: String,  required: true,  trim: true },
    description:  { type: String,  default: '' },
    price:        { type: Number,  required: true,  min: 0 },
    category:     { type: String,  required: true,  trim: true },
    image_url:    { type: String,  default: '' },
    is_available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodItem', foodItemSchema);
