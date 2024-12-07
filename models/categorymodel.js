const mongoose = require("mongoose");
const categoryschema = new mongoose.Schema({
   name:{type:String,required:true},
   description:{type:String,required:true},
   isoffer:{ type: Number},
})
module.exports=mongoose.model('category',categoryschema);