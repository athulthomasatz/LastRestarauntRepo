const mongoose = require('mongoose')
const guestSchema = new mongoose.Schema({ 
    gname: {
        type: String,
        required: true
    },
    seat: {
        type: Number,
        required: true, 

    },
    tablename: {
        type: String,
        required: true,

    }

})
const GuestData = mongoose.model('GuestData', guestSchema)
module.exports = GuestData;  