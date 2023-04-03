const staffDB = require('../models/staffData')
const cashierDB = require('../models/cashierData')
const managerDB = require('../models/managerData')
const Cart = require('../models/CartUser')
const Settings = require('../models/Settings')
exports.getAdminPage = (req,res) => {
    res.send("Admin Page")
}

exports.getAdminLoginPage = (req,res) => {  
    res.render('admin/login',{
      title : "Admin Login"})
}

exports.getAdminIncome = async(req,res)=>{ 
  
    // const startOfDay = new Date();
    // startOfDay.setHours(0, 0, 0, 0);
  
    // const endOfDay = new Date();
    // endOfDay.setHours(23, 59, 59, 999);
  
    // try {
    //   const totalIncome = await Cart.aggregate([
    //     { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
    //     { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    //   ]);
  
    //   const income = totalIncome[0].total;
    //   res.render('admin/income', { income });
    // } catch (error) {
    //   console.error(error);
    //   res.status(500).json({ error: 'Server Error' });
    // }
    res.render('admin/income',{
      title : "Income"})
  };
  

 
exports.postAdminloginPage = (req,res)=>{
    const { adminname ,adminpass } = req.body
    const adminName = 'superadmin';
    const adminPassword = '123';
    if( adminName == adminname && adminPassword == adminpass)
    {
      

        req.session.admin = adminName;
        req.session.adminAuth = true;
        // console.log(req.session.adminAuth)
        return res.redirect('/admin/dashboard')
    } 
    else{
        return res.redirect('/admin/login')
    }
    
}

exports.getAdminDashboard = (req,res)=>{
  res.render('admin/dashboard',{
    title : "Admin Dashboard"})
}


exports.getCashierVerifyPage = async(req,res)=>{
  try{
    const cashierList = await cashierDB.find({ verified : false }).lean();
    res.render('admin/verifyCashier',{ cashierList ,
    title : "Verify Cashier"})
  }catch(error){
    console.log(error);
    res.status(500).send("intera server error")
  }
  
}

exports.postCashierVerifyById = async (req, res) => {
  try {
    const cashierId = req.params.id;
    console.log(cashierId)
    await cashierDB.findByIdAndUpdate(cashierId, { verified: true }); 
  //   res.sendStatus(200);
    console.log("staff verified to true")
    res.redirect('/admin/verifyCashier') 
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};


exports.getStaffVerifyPage = async(req,res)=>{
  try {
      const staffList = await staffDB.find({ verified: false }).lean();
      
      res.render('admin/verifyStaff', { staffList ,
        title : "Verify Staff"});
    } catch (error) {
      console.log(error);
      res.status(500).send("internal server error")
    }
  
} 




  exports.postStaffVerifyById = async (req, res) => {
    try {
      const staffId = req.params.id;
      console.log(staffId)
      await staffDB.findByIdAndUpdate(staffId, { verified: true });
    //   res.sendStatus(200);
      console.log("staff verified to true")
      res.redirect('/admin/verifyStaff') 
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  };

  exports.getManagerVerifyPage = async(req,res)=>{
    try{
      const managerList = await managerDB.find({ verified : false }).lean();
      res.render('admin/verifyManager',{ managerList ,
        title : "Verify Manager"})
    }catch (error) {
      console.log(error);
      res.status(500).send("internal server error")
    }
    
  }

  exports.postManagerVerifyById = async(req,res)=>{ 
    try{
    const managerId = req.params.id;
    console.log(managerId);
    await managerDB.findByIdAndUpdate( managerId,{ verified : true });
    console.log("manager verified to true");
    res.redirect('/admin/verifyManager');
    }catch(error){
      console.log(error);
      res.sendStatus(500);
    }
    
  };
  exports.getSettings = async (req,res) => {
    const settings = await Settings.findOne({}).lean()
    res.render('admin/settings', {
      title : "Settings",
      admin : req.session.admin,
      settings
    })
  }

  exports.postSettings = async (req,res) => {
    console.log(req.body)
    if(req.body.add) {
      try {
        const mySettings = new Settings({
          name : req.body.name,
          facebook : req.body.facebook,
          instagram : req.body.instagram,
          twitter : req.body.twitter,
          description : req.body.description
        });
        await mySettings.save()
        res.redirect('/admin/settings')
      } catch (error) {
        console.log(error)
        res.render('errors/500', {
          title : "Internal Server Error"
        })
      } 
    } else {
      try {
        let updateSettings = await Settings.findOne({})
        updateSettings.name = req.body.name;
        updateSettings.description = req.body.description;
        updateSettings.facebook = req.body.facebook;
        updateSettings.instagram = req.body.instagram;
        updateSettings.twitter = req.body.twitter;
        await updateSettings.save();
        res.redirect('/admin/settings')
      } catch (error) {
        console.log(error)
        res.render('errors/500', {
          title : "Internal Server Error"
        })
      } 
    }
  }

  

  exports.getLogoutAdmin = (req,res)=>{
    req.session.admin = null
    req.session.adminAuth = false
    return res.redirect('/')

  }
















  








  // exports.getStaffVerifyPageById = async (req, res) => {
  //     try {
  //       const staffId = req.params.id;
  //       const staff = await staffDB.findById(staffId).lean();
  //       res.render('admin/verifyStaffById', { staff });
  //     } catch (error) {
  //       console.log(error);
  //       res.status(500).send('Internal server error');
  //     }
  //   };

// exports.postStaffVerifyPage = async(req,res)=>{
//     try {
//         const staffId = req.params.id;
//         await staffDB.findByIdAndUpdate(staffId, { verified: true },{ new: true });
//         res.redirect('/admin/verifyStaff');
//       } catch (error) {
//         console.log(error);
//         res.status(500).send("internal server error");
//       }

// }