const Category = require('../models/Category')
const Item = require('../models/Item')
const managerData = require('../models/managerData')
const { v4 } = require('uuid')
const bcrypt = require('bcryptjs')
const saltrounds = 10
const path = require('path');
const Order = require('../models/UserOrder')
const { getTotalQuantityByProduct } = require('../helpers/orderHelpers');
const GuestOrder = require('../models/GuestOrder')

const bodyParser = require('body-parser');


exports.getManagerPage = (req, res) => {
  res.send("Kitchen Manager Page")
}

exports.getManagerSignupPage = (req, res) => {
  res.render('manager/signup', {
    error: req.flash('error'),
    title: "Manager Signup"
  })
}

exports.postManagerSignupPage = async (req, res) => {
  try {
    const managerExist = await managerData.findOne({ ManagerEmail: req.body.msignmail })
    if (managerExist) {
      req.flash("error", "User Already Exist")
      return res.redirect('/manager/signup')
    }
    bcrypt.hash(req.body.msignpass, saltrounds, (err, hash) => {
      if (err) {
        console.log(err);
        return res.status(500).send("error in hashing password")
      }
      const manager = new managerData({
        ManagerName: req.body.msignname,
        Password: hash,
        ManagerEmail: req.body.msignmail,
        ManagerNumber: req.body.msignnumber,
        verified: false
      })
      manager.save().then(() => {
        req.flash("success", "Your account is waiting for the verification from admin")
        return res.redirect('/manager/login')

      })


    })
  }
  catch (error) {
    console.log(error);
    return res.status(500).send("internal servr error")
  }
}

exports.getManagerLoginPage = (req, res) => {

  res.render('manager/login', {
    error: req.flash("error"),
    success: req.flash("success"),
    title: "Manager Login "
  })
}

exports.postManagerLoginPage = async (req, res) => {
  const { memail, mpassword } = req.body;
  try {
    const managername = await managerData.findOne({ ManagerEmail: memail });
    if (!managername) {
      req.flash('error', "Manager Not Found")
      return res.redirect('/manager/login')
    }
    const isMatch = await bcrypt.compare(mpassword, managername.Password);
    if (!isMatch) {
      req.flash("error", "Password Not Matching");
      return res.redirect('/manager/login');
    }
    if (!managername.verified) {
      req.flash("error", "Your account is waiting for verification from admin")
      return res.redirect('/manager/login');
    } else {
      console.log("Manager founded");
    }

    req.session.managerAuth = true;
    console.log("manager session turned on ");
    return res.redirect("/manager/dashboard")
  } catch (error) {
    console.log(error);
    res.status(500).send(" server error Login")
  }
}


exports.getManagerDashboard = (req, res) => {
  res.render('manager/managerDashboard',
    { title: "Manager Dashboard " })
}


exports.getAddCategoryPage = (req, res) => {
  res.render('manager/addcategory', {
    title: "Add Category"
  })
}

exports.postAddCategoryPage = (req, res) => {
  let sampleFile;
  let uploadPath;
  if (!req.files || Object.keys(req.files).length == 0) {
    return res.status(400).json({ "message": "No file were uploaded" })
  }
  sampleFile = req.files.sampleFile
  const imageExtension = sampleFile.name.split('.')[1]
  const uploadUrl = v4() + `.${imageExtension}`;
  uploadPath = path.join(__dirname, '..', 'public', 'uploads', uploadUrl)
  console.log(uploadPath)
  sampleFile.mv(uploadPath, function (err) {
    if (err) {
      return res.status(500).send(err)
    }
  })

  const newCategory = new Category({
    imageUrl: uploadUrl,
    name: req.body.categoryname,
    description: req.body.categorydescription
  })

  newCategory.save()
    .then(() => {
      console.log('New category added to the database')
      res.redirect('/manager/dashboard')
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send('Error adding category to database')
    })
}

exports.getAddItemPage = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.render('manager/additem', {
      categories,
      title: "Add Item"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
}

exports.postAddItemPage = (req, res) => {

  let sampleFile;
  let uploadPath;
  if (!req.files || Object.keys(req.files).length == 0) {
    return res.status(400).json({ "message": "No file were uploaded" })
  }
  sampleFile = req.files.sampleFile
  const imageExtension = sampleFile.name.split('.')[1]
  const uploadUrl = v4() + `.${imageExtension}`;
  uploadPath = path.join(__dirname, '..', 'public', 'uploads', uploadUrl)
  console.log(uploadPath)
  sampleFile.mv(uploadPath, function (err) {
    if (err) {
      return res.status(500).send(err)
    }
  })

  const newItem = new Item({
    imageUrl: uploadUrl,
    name: req.body.itemname,
    price: req.body.itemprice,
    apprtime: req.body.apprtime,
    description: req.body.itemdescription,
    category: req.body.category
  })

  newItem.save()
    .then(() => {
      console.log('New item added to the database')
      res.redirect('/manager/dashboard')
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send('Error adding item to database')
    })
}


exports.getManagerMenuPage = async (req, res) => {
  try {
    // Retrieve all the categories
    const categories = await Category.find({}).lean();

    // Render the menu page with the categories
    res.render('manager/category', {
      categories,
      title: "Manager Menu Category"
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }

};

exports.getManagerCategoryPage = async (req, res) => {
  try {
    const { categoryName } = req.params;
    console.log(categoryName + " categoryname");

    // Retrieve the category with the given name
    const category = await Category.findOne({ name: categoryName }).lean();
    console.log(category);

    // Retrieve all the items that belong to that category
    const itemss = await Item.find({ category: category._id }).lean();
    console.log(itemss)
    // Render the category page with the items
    res.render('manager/category-items', {
      category, itemss,
      title: "Manager Menu Items"
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


exports.getUpdateCat = async (req, res) => {

  try {
    const categories = await Category.find({}).lean();
    res.render('manager/updatecategory', {
      categories,
      title: "Update Category"
    })

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error in update")
  }

};

exports.getUpdateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(categoryId + " id!!!!");


    // Retrieve the category with the given name
    const category = await Category.findById({ _id: categoryId }).lean();
    console.log(category);


    // Render the category page with the items
    res.render('manager/updateCategoryForm', { category });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


exports.postupdateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { categoryname, categorydescription } = req.body;
    console.log(categoryId);
    console.log(categoryname)

    // Find the category and update its name and description
    const category = await Category.findOneAndUpdate(
      { _id: categoryId },
      { name: categoryname, description: categorydescription },
      { new: true }
    );
    // const items = await Item.find({ category: category._id }).lean();
    // console.log(items)


    // Redirect to the category page with the updated data
    return res.redirect(`/manager/category`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


// Display all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).lean();
    res.render('manager/deletecategory', {
      categories,
      title: "Delete Category"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.body.categoryId;
    console.log(categoryId);
    console.log("delete catId");
    await Category.findByIdAndDelete(categoryId);
    console.log("succesfully Category Deleted");
    res.redirect('/manager/delete-category');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
};

exports.getItemsDeletePage = async (req, res) => {
  try {
    const categories = await Category.find({}).lean();
    const items = await Item.find({}).lean();
    res.render('manager/deleteitems', {
      categories, items,
      title: "Delete Items"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
// router.post('/items/delete',
exports.postDeleteItems = async (req, res) => {
  const itemId = req.body.itemId;

  try {
    await Item.findByIdAndDelete(itemId);
    console.log('Item deleted successfully');
    res.redirect('/manager/delete-items');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.getOngoingOrder = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: 'pending' }).populate('items.product', 'name quantity -_id').lean();
    console.log(orders);
    console.log("ongoing order ");
    if (!orders) {
      // If no ongoing order found, display a message on the page
      res.render('manager/OnGoingOrder', { message: 'No ongoing order found' });
      return;
    }
    const items = orders.flatMap(order => order.items.map(item => item.product));
    console.log(items);
    const totalQuantityByProduct = await getTotalQuantityByProduct();
    console.log("items ongoing order");
    res.render('manager/OnGoingOrder', {
      items, orders, totalQuantityByProduct,
      title: "Ongoing Order"
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getGuestOngoingOrder = async (req, res) => {
  try {

    const orders = await GuestOrder.find({})
      .populate('items.product', 'name price').lean();
    const ordersg = await GuestOrder.find().populate('user').lean();
    res.render('manager/GuestOrder', { orders, ordersg });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

}


exports.getManagerLogout = (req, res) => {
  req.session.managerAuth = false
  console.log("session turned false manager")
  console.log(req.session.managerAuth);
  return res.redirect('/')
}








