const mongoose = require('mongoose');  

const guestcartItemSchema = new mongoose.Schema({ 
  product: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantity: {
    type: Number,
    required: false,
    default: 1
  },
  addedAt: {
    type: Date,
    required: false,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    required: false,
    default: Date.now
  }
});

guestcartItemSchema.virtual('totalPrice').get(function() {
  return this.quantity * this.product.price;
});

const GuestCartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuestData',
    required: true
  },
  items: [guestcartItemSchema],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { toJSON: { virtuals: true } });

GuestCartSchema.virtual('grandTotal').get(function() {
  let total = 0;
  this.items.forEach((item) => {
    total += item.product.price * item.quantity;
  });
  return total;
});
const GuestCart = mongoose.model('GuestCart', GuestCartSchema); 

module.exports = GuestCart;
