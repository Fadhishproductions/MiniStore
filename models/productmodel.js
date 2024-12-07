const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true },
  stock: { type: String, required: true },
  status: { type: String, required: true },
  description: { type: String, required: true },
  img: [{ type: String, required: true } ],
  ogprice:{ type: Number},
  isoffer:{ type: Number},
  offer:{type:String},
});

module.exports = mongoose.model('Product', productSchema);


