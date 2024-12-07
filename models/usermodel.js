const mongoose = require("mongoose");
const { format } = require('date-fns');
const userschema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    gender:{
        type:String
    },
    is_admin:{
        type:Number,
        required:true
    },
    cart:{
        type: mongoose.Schema.Types.ObjectId, ref: 'cart',
    },
    address:[{
        name:{ type:String},
    mobile:{type:Number},
    pincode:{type:Number},
    locality:{ type:String},
    address:{ type:String},
    district:{ type:String},
    state:{ type:String},
    type:{type:String}
    }],
    is_blocked:{
        type:Number,
        default:0
    },
    wishlist:[{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    wallet:{ balance:{type:Number} , 
             hystory:[{
                 amount:{type:Number} , date:{ type: String, default: format(new Date(), 'dd/MM/yyyy') },
                 status:{ type:String},description:{ type:String}
              }]},
    referralCode:{type:String} , 
    referredBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  
})
module.exports = mongoose.model("User", userschema);
