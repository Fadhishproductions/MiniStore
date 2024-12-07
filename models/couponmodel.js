const mongoose = require("mongoose");
const couponschema = new mongoose.Schema({
   Couponcode:{type:String,required:true},
   expirydate:{type:Date,required:true},
   mindiscount:{type:Number,required:true},
   discount:{type:Number,required:true},
   status:{type:String,required:true},
   used:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
})
module.exports=mongoose.model('coupon',couponschema);