const hbs = require('hbs');

hbs.registerHelper('calculateTotalPrice', (quantity, price) => {
  return quantity * price;
});


module.exports = {
    calculateTotalPrice: function(quantity, price) {
      return quantity * price;
    }
  };
  