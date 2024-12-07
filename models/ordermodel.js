const mongoose = require('mongoose');
const { format } = require('date-fns');
const orderSchema = new mongoose.Schema({
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products:[{
                  product:{type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
                  quantity:{ type:Number, required: true},
                  productinfo:{},
                  Cancelled: { type: Boolean, default: false }, 
             }],
    address:{
        name:{ type:String},
    mobile:{type:Number},
    pincode:{type:Number},
    locality:{ type:String},
    address:{ type:String},
    district:{ type:String},
    state:{ type:String},
    type:{type:String}
    },
    paymentstatus:{type:String, required: true},
    orderstatus:{type:String, required: true},
    orderdate: { type: String, default: format(new Date(), 'dd/MM/yyyy') },
    subtotal: { type:Number},
    total: { type:Number},
    shipping: { type:Number},
    coupon: { type:String},
    discount: { type:Number},
    cancelreason:{type:String},
    returnreason:{type:String}
});
module.exports = mongoose.model('Order', orderSchema);