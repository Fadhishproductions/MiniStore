const mongoose = require("mongoose");
const companyschema = new mongoose.Schema({
   name:{type:String,required:true},
   description:{type:String,required:true},
   category:[ {type: mongoose.Schema.Types.ObjectId}],
})
module.exports=mongoose.model('company',companyschema);