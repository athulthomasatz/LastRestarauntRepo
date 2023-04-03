const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId,   
    ref: 'Item', 
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  totalPrice : {
    type : Number,
    required : true
  }
});


const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserData',
    required: true 
  }, 
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: false
  },
  paymentStatus: {
    type: String,
    required: false,
    

  },
  orderStatus: {
    type: String,
    required: false
  },
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
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
