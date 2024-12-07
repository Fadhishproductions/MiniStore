const mongoose = require("mongoose");
const cartschema = new mongoose.Schema({
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products:[{
              product:{type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
              quantity:{ type:Number}
            }]
})
module.exports =mongoose.model('cart',cartschema)
