const staffDB = require('../models/staffData')
const bcrypt = require('bcryptjs')
const saltrounds = 10
const GuestOrder = require('../models/GuestOrder')



exports.getStaffPage = (req, res) => {
    res.send("Staff Page")
}

exports.getStaffLoginPage = (req, res) => {
    res.render('staff/login', {
        error: req.flash("error"),
        success: req.flash("success")
    });
};
exports.postStaffLoginPage = async (req, res) => {

    const { staffmail, staffpass } = req.body
    try {
        const staff = await staffDB.findOne({ StaffEmail: staffmail })
        if (!staff) {
            req.flash("error", "Staff Not Found")
            return res.redirect('/staff/login')
        }
        const isMatch = await bcrypt.compare(staffpass, staff.Password);
        if (!isMatch) {
            req.flash("error", "Password Not Matching")
            return res.redirect("/staff/login")
        } else {
            console.log("staff found and password founded");
        }
        if (!staff.verified) {
            // Staff member not verified, render error message
            req.flash("error", "Your account is waiting for the verification from admin")
            return res.redirect('/staff/login');

        }

        req.session.staffAuth = true
        console.log('session turned on');
        console.log(req.session.staffAuth);
        return res.redirect("/staff/staffDashboard")

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }


}

exports.getStaffDashboard = async (req, res) => {
    try {

        const orders = await GuestOrder.find({})
            .populate('items.product', 'name price').lean();
        const ordersg = await GuestOrder.find().populate('user').lean();
        res.render('staff/staffDashboard', { orders, ordersg });
        console.error(err);
        res.status(500).send('Server Error');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getStaffSignupPage = (req, res) => {

    res.render('staff/signup', {
        error: req.flash("error"),
        success: req.flash("success")
    })
}

exports.postStaffSignupPage = async (req, res) => {
    try {
        const staffexist = await staffDB.findOne({ StaffEmail: req.body.ssignmail })
        if (staffexist) {
            req.flash("error", "Staff Already Exist")
            console.log("Staff already exist!!!!")
            return res.redirect('/staff/signup')
        }
        bcrypt.hash(req.body.ssignpass, saltrounds, (err, hash) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error hashing password')
            }
            const staff = new staffDB({
                StaffName: req.body.ssignname,
                Password: hash,
                StaffEmail: req.body.ssignmail,
                verified: false
            })
            staff.save().then(() => {
                console.log("staff added to database not verified")
                res.redirect('/staff/login')

            })
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send("internal server error")
    }

}
exports.getStaffLogout = (req, res) => {
    req.session.staffAuth = false
    console.log("session turned false staff")
    console.log(req.session.staffAuth);
    return res.redirect('/')
}
