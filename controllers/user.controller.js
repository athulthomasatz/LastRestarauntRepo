const Category = require('../models/Category')
const Item = require('../models/Item')
const usersData = require('../models/UserData')
const Cart = require('../models/CartUser')
const Order = require('../models/UserOrder')
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const sessions = require('express-session');
const session = require('express-session');
const UserData = require('../models/UserData');

exports.getUserPage = (req, res) => {
    res.send("User Page")
}
exports.getUserLoginPage = (req, res) => {
    res.render('user/login', {
        error: req.flash('error'),
        success: req.flash('success')
    })
}
exports.postUserLoginPage = async (req, res) => {
    const { logmail, logpass } = req.body;
    try {
        //  database field : loginform name
        const users = await usersData.findOne({ Email: logmail });
        if (!users) {
            req.flash('error', "User Not Found!!")
            return res.redirect('/user/login')
        }
        // form,passworddatabase
        const isMatch = await bcrypt.compare(logpass, users.Password);
        if (!isMatch) {
            req.flash('error', "Password Incorrect")
            return res.redirect('/user/login')
        } else {
            console.log("User and Password succesfully found")
        }
        // Create a session for the user
        req.session.useId = {
            id: users.id,
            name: users.UserName
        }
        req.session.userAuth = true
        console.log(req.session.useId)
        res.redirect('/user/menu');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
}

exports.getUserSignupPage = (req, res) => {
    res.render('user/signup', {
        error: req.flash('error')
    })

}

exports.postUserSignupPage = async (req, res) => {
    try {
        const userExist = await usersData.findOne({ Email: req.body.signmail }).lean()
        if (userExist) {
            req.flash("error", "User Alredy Exist !!")
            return res.redirect('/user/signup')
        }

        bcrypt.hash(req.body.signpass, saltRounds, (err, hash) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error hashing password');
            }
            const newUser = new usersData({
                UserName: req.body.signname,
                Password: hash,
                Email: req.body.signmail,
                Number: req.body.signnumber
            });

            newUser.save().then(() => {
                req.flash("success", "User Added Successfully")
                res.redirect('/user/login');
            })

        })
    } catch (error) {
        res.render("errors/500", {
            title: "Internal Server Error error adding user",
        });

    }


}



exports.getUserMenuPage = async (req, res) => {
    try {
        const userName = req.session.useId.name;
        console.log(userName + "username in menu page found");
        // Retrieve all the categories
        const categories = await Category.find({}).lean();

        // Render the menu page with the categories
        res.render('user/menu', { categories, userName });
        console.log(categories);
    } catch (err) {
        res.render("errors/500", {
            title: "Internal Server Error",
        });
    }
}

exports.getUserMenuItemPage = async (req, res) => {
    try {
        const userName = req.session.useId.name;
        const { categoryName } = req.params;
        console.log(categoryName + " categoryname");

        // Retrieve the category with the given name
        const category = await Category.findOne({ name: categoryName }).lean();

        // Retrieve all the items that belong to that category
        const items = await Item.find({ category: category._id }).lean();


        // Loop through the items and add the quantity property to each item object
        for (let i = 0; i < items.length; i++) {
            const cartItem = await Cart.findOne({ user: req.session.useId.id, item: items[i]._id });
            if (cartItem) {
                items[i].quantity = cartItem.quantity;
                console.log(cartItem.quantity);

            } else {
                items[i].quantity = 0;
            }
        }


        // Render the category page with the items
        res.render('user/menu-items', { category, items, userName });
    } catch (err) {
        res.render("errors/500", {
            title: "Internal Server Error",
        });
    }
}

exports.getUserCartPage = async (req, res) => {
    const userName = req.session.useId.name;
    const fetchuser = await UserData.findById(req.session.useId.id);
    console.log(fetchuser + " user found fethced");
    // Define a new route to display the user's cart items
    try {
        // Find  user's cart and populate the items array with the corresponding product documents
        const cart = await Cart.findOne({ user: req.session.useId.id }).populate('items.product').lean();

        if (!cart) {
            return res.render('user/cart', { cart: null, grandTotal: 0 , userName});
        }

        // Calculate the total price for each cart item
        cart.items.forEach(item => {
            item.totalPrice = item.product.price * item.quantity;
        });


        // Calculate the grand total of all cart items
        const grandTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        console.log(grandTotal + "grandfdf");
        res.render('user/cart', { cart, grandTotal, userName });
    } catch (error) {
        res.render("errors/500", {
            title: "Internal Server Error",
        });
    }
};
exports.addToCart = async (req, res) => {
    try {
        const userId = req.session.useId.id;
        console.log(userId + " user id found");
        let userCart = await Cart.findOne({ user: userId });
        if (!userCart) {
            userCart = await new Cart({
                user: userId
            }).save()
            console.log("new cart created for user!!!:)", userId);
        }
        const { itemId, quantity } = req.body;
        console.log(itemId + " item found and no :" + quantity);
    
        const existingItem = userCart.items.find(item => item.product.toString() === itemId);
        console.log(existingItem);
        console.log("cart exist");
        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
            existingItem.updatedAt = Date.now();
            console.log('Item quantity updated in cart:', existingItem);
        } else {
            userCart.items.push({ product: itemId, quantity: parseInt(quantity) });
            console.log('Item added to cart:', itemId);
        }
        // Save cart to database
        await userCart.save();
        res.redirect('/user/menu/');
    } catch (error) {
        res.render("errors/500", {
            title: "Internal Server Error",
        });

        // console.error(error);
        // res.status(500).json({ error: 'Server Error' });
    }
}

exports.getOrderPage = async (req, res) => {
    const userName = req.session.useId.name;
    try {
        // Get the user ID from the authenticated session
        const userId = req.session.useId.id;

        // Find all orders for the user and populate the product information
        // const orders = await Order.find({ user: userId }).populate('items.product').lean()
        const orders = await Order.find({ user: userId }).populate('items.product').lean()

        // Render the ordered items view and pass in the orders data
        res.render('user/order', { orders, userName });
    } catch (error) {
        res.render("errors/500", {
            title: "Internal Server Error",
        });
    }



}


exports.placeOrder = async (req, res) => {
    try {
        // Get the user ID from the authenticated session 
        const userId = req.session.useId.id;
        console.log(userId + "place order userid");

        // Get the cart items for the user
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty. Please add items before placing an order.' });
        }

        // Create an order
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price,
            totalPrice: item.quantity * item.product.price
        }));

        // Check if there is an existing order for the user
        const existingOrder = await Order.findOne({ user: userId, orderStatus: 'pending' });

        if (existingOrder) {
            console.log("hello existing ordr block");
            // If an existing order exists, update it with the new order items
            existingOrder.items = existingOrder.items.concat(orderItems);
            console.log(existingOrder);
            console.log("order exist");
            console.log(orderItems + "merge error");
            existingOrder.totalAmount += cart.grandTotal;
            await existingOrder.save();
        } else {
            const order = new Order({
                user: userId,
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
        await Cart.findOneAndUpdate({ user: userId }, { items: [] });

        // Redirect to the ordered items page
        res.redirect('/user/order');
    } catch (err) {
        res.render("errors/500", {
            title: "Internal Server Error",
        });
    }
};





exports.userLogout = (req, res) => {
    req.session.useId = null
    req.session.userAuth = false
    console.log("session Turned false")
    res.redirect('/')
}


