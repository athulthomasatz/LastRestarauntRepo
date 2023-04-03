const cashierdata = require('../models/cashierData')
const UserOrder = require('../models/UserOrder')
const GuestOrder = require('../models/GuestOrder') 
const bcrypt = require('bcryptjs')
const saltrounds = 10
exports.getCashierPage = (req,res) => {
    res.send("Cashier Page")
}

exports.getCashierLoginPage = (req,res) => { 

    res.render('cashier/login', {
        error: req.flash("error"),
        success: req.flash("success"),
        title : "Cashier Login"
    });
} 

exports.postCashierLoginPage = async(req,res)=>{
    const { cemail , cpassword } = req.body
    try{
        const cashier = await cashierdata.findOne({ CashierEmail : cemail })
        if(!cashier){
            req.flash("error","Cashier Not Found")
            return res.redirect('/cashier/login')
        }
        const isMatch = await bcrypt.compare(cpassword ,cashier.Password)
        if(!isMatch){
            req.flash("error","Password Not Matching")
            return res.redirect("/cashier/login")
        }else{
            console.log("cashier found ");
        }
        if(!cashier.verified){
            req.flash("error", "Your account is waiting for the verification from admin")
            return res.redirect('/cashier/login');
        }

        req.session.cashierAuth = true
        console.log('session turned on');
        console.log(req.session.cashierAuth);
        return res.redirect("/cashier/cashierDashboard")
    }catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }

 
}

exports.getCashierDashboard = (req,res)=>{
    res.render('cashier/cashierDashboard',
    {title : "Dashboard Cashier"})
}

exports.getCashierSignup = (req,res)=>{

    res.render('cashier/signup',{
        error : req.flash('error'),
        title : "Cashier Signup"
    })
}
        
 

exports.postCashierSignup = async(req,res)=>{
    try{
        const cashierexist = await cashierdata.findOne({ CashierEmail : req.body.csignmail})
        if(cashierexist){
            req.flash("error","Already account created")
            return res.redirect('/cashier/signup')
        }
        bcrypt.hash(req.body.csignpass,saltrounds,(err,hash)=>{
            if(err){
                console.log(err);
                return res.status(500).send('error in hasing password')
            }
            const cashier = new cashierdata({
                CashierName : req.body.csignname,
                Password : hash,
                CashierEmail : req.body.csignmail,
                CashierNumber : req.body.csignnumber, 
                verified : false
            })
            cashier.save().then(()=>{
                console.log("cashier is added to db not verified ");
                res.redirect('/cashier/login')
            })

            

        })
    }
    catch(error){
        console.log(error);
        res.status(500).send("internal server error most probabaly because of db error")
    }
}

exports.getOngoingOrders = async (req, res) => {
    try {
      // find all ongoing orders and populate the user field
      const ongoingOrders = await UserOrder.find({ paymentStatus: 'pending' }).populate('user', 'name');
      
      // map the order ID, total amount, and user name for each ongoing order
      
      const orders = ongoingOrders.map(order => ({ id: order._id, totalAmount: order.totalAmount, userName: order.user.UserName }));
      // render the printOngoingOrder view with the orders
      res.render('cashier/printOngoingOrder', { orders ,
    title : "Ongoing Order "});
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }

  exports.changePaymentStatus = async (req, res) => {
    try {
      const orderId = req.body.orderId;
      const order = await UserOrder.findById(orderId); 
      
  
      if (!order) {
        return res.status(404).send('Order not found');
      }
      order.paymentStatus = 'pending';
      await order.save();
    
  
      res.redirect('/cashier/ongoingOrder');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
  
  
  




exports.getCashierLogout = (req,res)=>{
    req.session.cashierAuth = false
    console.log("session turned false cashier")
    console.log(req.session.cashierAuth);
    return res.redirect('/')
}