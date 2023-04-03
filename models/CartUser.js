const mongoose = require('mongoose');  

const cartItemSchema = new mongoose.Schema({  
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

cartItemSchema.virtual('totalPrice').get(function() {
  return this.quantity * this.product.price;
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserData',
    required: true
  },
  items: [cartItemSchema],
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

CartSchema.virtual('grandTotal').get(function() {
  let total = 0;
  this.items.forEach((item) => {
    total += item.product.price * item.quantity;
  });
  return total;
});
const Cart = mongoose.model('Cart', CartSchema); 

module.exports = Cart;
