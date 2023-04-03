const mongoose = require('mongoose');

const guestorderItemSchema = new mongoose.Schema({
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
  gprice: {
    type: Number,
    required: true
  },
  totalPrice : {
    type : Number,
    required : true
  }
});


const GuestOrderSchema = new mongoose.Schema({ 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuestData',
    required: true
  }, 
  items: [guestorderItemSchema],
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
    required: false
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

const GuestOrder = mongoose.model('GuestOrder', GuestOrderSchema);

module.exports = GuestOrder; 
