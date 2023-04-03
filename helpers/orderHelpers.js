const Order = require('../models/UserOrder');

async function getTotalQuantityByProduct() {
  try {
    const result = await Order.aggregate([
      { $unwind: "$items" },
      { 
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" }
        }
      }
    ]);
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = {
  getTotalQuantityByProduct
};
