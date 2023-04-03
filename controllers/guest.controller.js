const Category = require('../models/Category')
const Item = require('../models/Item')
const session = require('express-session')
const shortid = require('shortid');
const GuestData = require('../models/GuestData')
const GuestCart = require('../models/GuestCart')
const GuestOrder = require('../models/GuestOrder')
const SettingG = require('../models/Settings')

exports.getWelcomePage = async (req, res) => {
  const settings = await SettingG.find().lean()
  res.render('guest/welcome', {
    settings,
    title: "Smart Restaurant"
  })
}
exports.getGuestdetails = (req, res) => {

  res.render('guest/GuestDetails', {
    title: "Table details"
  })
}
exports.postGuestdetails = async (req, res) => {
  const { name, seats, table } = req.body
  try {
    // const guestExist = await GuestData.findOne({ name: req.body.name }).lean()

    const newGuest = new GuestData({
      gname: req.body.name,
      seat: req.body.seats,
      tablename: req.body.table
    });

    await newGuest.save()

    // Store guest data in session
    req.session.guestId = newGuest._id
    req.session.guestName = newGuest.name




    req.session.guestAuth = true
  } catch (error) {
    res.render("errors/500", {
      title: "Internal Server Error",
    });
  }

  res.redirect('/guest/menu')
}


exports.getGuestMenu = async (req, res) => {
  try {

    // Retrieve all the categories
    const categories = await Category.find({}).lean();
    // const guestUserId = shortid.generate(); // generate a unique guest ID
    // req.session.guestId = guestUserId;
    // console.log(req.session.guestId);
    // req.session.guestAuth = true;
    // const newGuest = new GuestId({
    //   GuestSessionid: req.session.guestId

    // });

    // newGuest.save()

    // Render the menu page with the categories
    res.render('guest/menu', {
      categories,
      title: "Menu "
    });
  } catch (err) {
    res.render("errors/404", {
      title: "Internal Server Error",
    });
  }
}

exports.getGuestItems = async (req, res) => {
  try {
    const { categoryName } = req.params;
    console.log(categoryName + " categoryname"); 

    // Retrieve the category with the given name
    const category = await Category.findOne({ name: categoryName }).lean();
    console.log(category);

    // Retrieve all the items that belong to that category
    const items = await Item.find({ category: category._id }).lean();
    console.log(items + "items!!!")
    // Render the category page with the items
    res.render('guest/menu-items', {
      category, items,
      title: "Items"
    });
  } catch (err) {
    res.render("errors/500", {
      title: "Internal Server Error",
    });
  }
}
exports.addtocart = async (req, res) => {
  try {
    const guestId = req.session.guestId;
    console.log(guestId);
    console.log("guest id")
    let guestCart = await GuestCart.findOne({ user: guestId });

    if (!guestCart) {
      guestCart = await new GuestCart({
        user: guestId
      }).save()
      console.log("new cart created for guesttt!!!:)", guestId);
    }
    const { itemId, quantity } = req.body;
    console.log(itemId + " item found and no :" + quantity);
    const existingItem = guestCart.items.find(item => item.product.toString() === itemId);
    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
      existingItem.updatedAt = Date.now();
      console.log('Item quantity updated in cart:', existingItem);
    } else {
      guestCart.items.push({ product: itemId, quantity: parseInt(quantity) });
      console.log('Item added to cart:', itemId);
    }
    // Save cart to database
    await guestCart.save();
    res.redirect('/guest/menu/');
  } catch (error) {
    res.render("errors/500", {
      title: "Internal Server Error",
    });
  }
}



exports.getGuestCartPage = async (req, res) => {
  const guestfindid = req.session.guestId;
  console.log(guestfindid);

  const fetchuser = await GuestData.findById(guestfindid);
  console.log(fetchuser + " guest found fethced");
  // Define a new route to display the user's cart items
  try {
    // Find  user's cart and populate the items array with the corresponding product documents
    const cart = await GuestCart.findOne({ user: guestfindid }).populate('items.product').lean();
    console.log(cart);
    console.log("display guest cart");
    if (!cart) {
      return res.render('guest/cart-view', { cart: null, grandTotal: 0 });
    }

    // Calculate the total price for each cart item
    cart.items.forEach(item => {
      item.totalPrice = item.product.price * item.quantity;
    });


    // Calculate the grand total of all cart items
    const grandTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    console.log(grandTotal + "grandfdf");
    res.render('guest/cart-view', {
      cart, grandTotal,
      title: "Cart"
    });
  } catch (error) {
    console.log(error)
    res.render("errors/500", { title: "Internal Server Error" });
  }
}

exports.getOrderPage = async (req, res) => {
  try {
    // Get the user ID from the authenticated session
    const guestId = req.session.guestId;

    // Find all orders for the user and populate the product information
    const orders = await GuestOrder.find({ user: guestId }).populate('items.product').lean()

    // Render the ordered items view and pass in the orders data
    res.render('guest/order', {
      orders,
      title: "Orders"
    });
  } catch (err) {
    console.error(err);
    res.render('error/500', { message: 'Error getting ordered items' });
  }


}

exports.placeOrder = async (req, res) => {
  try {
    // Get the user ID from the authenticated session 
    const guestId = req.session.guestId;
    console.log(guestId + "place order guestid");

    // Get the cart items for the user
    const cart = await GuestCart.findOne({ user: guestId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty. Please add items before placing an order.' });
    }

    // Create an order
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      gprice: item.product.price,
      totalPrice: item.quantity * item.product.price
    }));

    // Check if there is an existing order for the user
    const existingOrder = await GuestOrder.findOne({ user: guestId, orderStatus: 'pending' });

    if (existingOrder) {
      console.log("hello existing ordr block");
      // If an existing order exists, update it with the new order items
      existingOrder.items = existingOrder.items.concat(orderItems);
      console.log(orderItems + "merge error");
      existingOrder.totalAmount += cart.grandTotal;
      await existingOrder.save();
    } else {
      const order = new GuestOrder({
        user: guestId,
        items: orderItems,
        totalAmount: cart.grandTotal,
        paymentMethod: req.body.paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending'
      });

      // Save the order to the database
      await order.save();


    }

    // Clear the user's cart
    await GuestCart.findOneAndUpdate({ user: guestId }, { items: [] });

    // Redirect to the ordered items page
    res.redirect('/guest/order');
  } catch (err) {
    res.render("errors/500", { title: "Internal Server Error" });
  }
}


exports.dashboardSearch = async (req, res) => {
  try {
    console.log("hai iam inside get searcgh");
    res.render("guest/search", {
      searchResults: "",
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    res.render("errors/500", { title: "Internal Server Error" });
  }
};

/**
 * POST /
 * Search For Notes
 */
exports.dashboardSearchSubmit = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    console.log(searchTerm);
    const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const searchResults = await Category.find({
      $or: [
        { name: { $regex: new RegExp(searchNoSpecialChars, "i") } },
        { description: { $regex: new RegExp(searchNoSpecialChars, "i") } },
      ],
    });

    res.redirect("/guest/search", {
      searchResults,
      layout: "../views/layouts/dashboard",
    });
  } catch (error) {
    res.render("errors/404", { title: "Internal Server Error" });
  }
};

