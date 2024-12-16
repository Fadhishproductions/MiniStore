const User = require('../models/usermodel');
const Product = require('../models/productmodel');
const Category = require('../models/categorymodel');
const Company = require('../models/companymodel');
const Cart = require('../models/cartmodel');
const Order = require('../models/ordermodel');
const Coupon = require("../models/couponmodel");
const bcrypt = require('bcrypt');
const getotp = require('../utilities/sendmail');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Razorpay = require('razorpay');

const crypto = require('crypto');
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_key_id,
  key_secret: process.env.RAZORPAY_key_secret,
});


let name ,email, password,mobile,otpp,referralCode;
let data ='';let logindata='';

const loadSignup = async (req,res)=>{

    try{
//  const data=""
const varify =req.session.user_id;
let count = '0'
        res.render('signup', { data,errors: false ,varify,count,old:{name:'',email:''}});
    }catch(err){
        res.send(err.msg)
    }
}


const insertUser = async (req, res) => {
    try {
        // Perform validation
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const varify = req.session.user_id;
            let count = '0';
            return res.json({ errors: errors.array()});
        }

        // Check if user already exists
        email = req.body.email;
        const user = await User.findOne({ email: email });
        if (user) {
            return res.json({ message: 'Account already exists!' });
        }

        // Check referral code
        if (req.body.referralCode) {
            const referralCode = req.body.referralCode;
            const referredByUser = await User.findOne({ referralCode: referralCode });
            if (!referredByUser) {
                return res.json({ message: 'Referral code is not valid!' });
            }
        }

        // Proceed with sign-up process
         name = req.body.name;
        password = req.body.password;
        mobile = req.body.mobile;

        // Generate OTP
        const otp = getotp(req.body.mobile);
        otpp=otp;
        console.log(otpp,"otp global")
        return  res.json({ redirectTo: '/varifyotp' });
        // Respond with success message and OTP
        // return res.json({ message: 'OTP sent successfully.', otp: otp });

    } catch (err) {
        // Handle unexpected errors
         res.send({ error: err.message });
    }
}

  
  
const resendotp = async(req,res)=>{
    try {
        const otp =  getotp(mobile);
        console.log("otp from function :",otp);
        otpp=otp;
        console.log("otp saved to global :",otpp);
        res.redirect('/varifyotp');

    } catch (error) {
        res.send(err.msg)
    }
}

const loadotp = async(req,res)=>{
    try { 
        const varify =req.session.user_id;
        const data =''
        let count = '0'
        res.render('otp',{varify,data,count});
    } catch (error) {
        res.send(error.msg)
    }
}

const loadforgotpassword = async (req, res) => {
    try {
        const varify = req.session.user_id;
        let count = '0';
        console.log(varify);
        res.render('forgotpassword', {  varify ,count}); // Pass 'varify' as part of the data object
    } catch (err) {
        res.send(err.msg);
    }
}

const forgotpassword = async (req, res) => {
    try {
        console.log(req.body);
        const checkuser =await User.findOne({email:req.body.email});
        email = req.body.email;
        console.log(checkuser)
        if(checkuser!==null){  
            console.log("matched") 
            const otp = getotp(checkuser.mobile);
            otpp=otp;
            var obscuredLength = 5;var countryCode = checkuser.mobile.substring(0, 3);
            var obscuredPart = checkuser.mobile.substring(3, checkuser.mobile.length - obscuredLength);
            var obscuredPhoneNumber = countryCode + "*****" + checkuser.mobile.slice(-obscuredLength);
            res.json({success:true , msg:`Otp is send to ${obscuredPhoneNumber} ..!`});
           
        }else{ console.log("not matched") 
            res.json({success:false ,error:"There is no user found with this email..!"});
        }
    } catch (error) {
        res.send(error.msg);
    }
}

const loadvarifyforgotpassword = async(req,res)=>{ 
    try {
        const varify =req.session.user_id;
        const data =''
        let count = '0'
        res.render('varifyforgotpassword',{varify,data,count});
    } catch (error) {
        res.send(err.msg);
    }
}

const varifyforgotpassword = async(req,res)=>{
try {
    console.log("otp in global and otp from user",otpp,req.body.otp);
    if(otpp==req.body.otp){
res.json({success:true,msg:"Enter your new password"});
    }else{
        res.json({success:false,msg:"Otp is incorrect"});
    }
} catch (error) {
    res.send(err.msg);
}
 }

 const addforgotpassword = async(req,res)=>{
    try {
        console.log(req.body);
        console.log(email)
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
           let  error = JSON.stringify(errors);
             console.log("first errors",errors)
            res.json({success:false,errors:errors.array()})
            return;
        }
const password = req.body.password;
const hpassword = await bcrypt.hash(password,10);
        const addpassword =await User.updateOne({email:email},{password:hpassword});
        res.json({success:true,msg:"Your password is changed"});
    } catch (error) {
        res.send(error.msg);
    }
 }

const varifyotp = async(req,res)=>{ 
try {
    console.log("in varifyotp")
    const otp = req.body.otp;
    console.log(otp,otpp,"varify");
    if(otpp ==otp){
        console.log("in equal password",password)
   const hpassword = await bcrypt.hash(password,10);
   console.log("Hashed Password:", hpassword);
   const newuser = new User({
    name:name,
            email:email,
            password:hpassword,
            mobile:mobile,
            is_admin:0
   })
   console.log("referralCode global",referralCode)
   if(typeof referralCode !== 'undefined'){
    console.log("in otp referal")
    console.log("referralCode global",referralCode)
    const referredByUser = await User.findOne({ referralCode: referralCode });
    newuser.referralCode=""+referralCode;
    newuser.referredBy=referredByUser._id;
    newuser.wallet={ balance:100 , 
                     hystory:[{amount: 100, status:'credit',description:'Referral offer'}]};
    walletdetails = {amount: 100, status:'credit',description:'Referral offered'};
    const addwallet = await User.updateOne({_id:referredByUser._id},{$inc:{'wallet.balance':100},$push:{'wallet.hystory':walletdetails}})
  console.log("addwallet",addwallet)
   }
   console.log("out otp referal")
   const userdata = await newuser.save();
   console.log("userdata",userdata)
//    res.session.user_id=userdata._id
   console.log("User Data:", userdata);
 if(userdata){
    console.log("success")
data ="your registration is successfull";
return res.json({success:true,msg:"your registration is successfull"})
res.redirect('/signup');
}else{
    console.log("unsuccess")
    data ="your registration is notsuccessfull";
    return res.json({success:false,msg:"your registration is notsuccessfull"});
    // res.redirect('/signup');
}


    }else{
        console.log(otp,otpp)
        console.log('incorrect otp');
        return res.json({success:false,msg:'incorrect otp'});
        // const varify =req.session.user_id;
        // const data ='otp is incorrect';
        // let count = 0
        // res.render('otp',{varify,data,count});
    }

} catch (err) {
    res.send(err.msg)
}
}



const loadLogin = async (req, res) => {
    try {
        const varify = req.session.user_id;
        let count = '0';
        console.log(varify);
       const data =logindata
        res.render('login', { data, varify ,count}); // Pass 'varify' as part of the data object
    } catch (err) {
        res.send(err.msg);
    }
}


const varifylogin = async (req,res)=>{

    try {
console.log(req.body)
        const useremail=req.body.email;
        console.log(useremail);
        const password = req.body.password;
        console.log(password);
        const user = await User.findOne({email:useremail});
      
        console.log(user)
        if(user){
        if(user.is_admin==0 && user.is_blocked==0 )
        {
            console.log("user finded")
             const passwordmatch = await bcrypt.compare(password,user.password)
            console.log("passwor matched:",passwordmatch)
            if(passwordmatch)
            {
            console.log('passwordmatched')
            req.session.user_id=user._id;
            res.redirect('/home');
            }
            else
            {
            console.log('password not matched')
            logindata = 'password is incorrect';
            res.redirect('/login')
           }}
        else{
            logindata = 'Email is incorrect.please enter valid email';
            res.redirect('/login')
        }}
          else
          {
             console.log("not found");
 
              logindata = 'Email is incorrect.please enter valid email';
             res.redirect('/login')
          }
    } catch (err) {
        res.send(err.msg)
    }
}

const loadhome = async(req,res)=>{
try {
    const varify =req.session.user_id
    console.log(varify);
    let count = 0;
    console.log(count)
    const cart = await Cart.find({user:varify})
    console.log("after cartcount")
    console.log("cartfound",cart)
    console.log("cart count",cart.length)
    if(cart.length==1){
        console.log("in count")
      count =  cart[0].products.length;
      console.log("after count")
    }
    const category = await Category.find()
    const product = await Product.find({status:"published"})
    res.render('home',{varify,category,product,count});
} catch (error) {
    res.send(error.msg);
}
}
const loadproductpage = async(req,res)=>{
    try {
        const varify =req.session.user_id
        console.log(varify);
        const id= req.query.id;
        let count = 0;
        console.log("count:",count)
        const cart = await Cart.find({user:varify})
        console.log(cart)
        if(cart.length>0){
            count =  cart[0].products.length;
        }
        const category = await Category.find();
        const currentcategory = await Category.findOne({_id:id});
        console.log("name",currentcategory)
        const product = await Product.find({category:id,status:"published"})
        const brand = await Company.find();
        res.render('categoryproducts',{varify,category,product,count,currentcategory,brand});
    } catch (error) {
        res.send(error.msg)
    }
}

const autocomplete = async(req,res)=>{
    try {
        console.log('query from ui',req.query.query)
        const query = req.query.query;
        const sanitizedQuery = query.replace(/\s+/g, ''); // Remove spaces from the query
        console.log("sanitized",sanitizedQuery)
        const regexString = sanitizedQuery.split('').join('\\s*'); // Insert \s* between each character
        console.log("removing sapce",regexString)
        const regex = new RegExp( regexString, 'i');
        
        console.log('Sanitized Query:', sanitizedQuery);
        
        try {
            const suggestions = await Product.find({ name: { $regex: regex } });
        
            console.log('Suggestions:', suggestions);
        
            res.json(suggestions.map(product => product.name));
        } catch (error) {
            console.error('Error retrieving suggestions:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
      
console.log(suggestions);
const suggestionNames = suggestions.map(product => product.name);
res.json(suggestionNames);        

    } catch (error) {
        res.send(error.msg)
    }
}

const productSearch = async(req,res)=>{
    try {
        console.log(req.body)
        const query = req.body.search;
        const sanitizedQuery = query.replace(/\s+/g, ''); // Remove spaces from the query
        console.log("sanitized",sanitizedQuery)
        const regexString = sanitizedQuery.split('').join('\\s*'); // Insert \s* between each character
        console.log("removing sapce",regexString)
        const regex = new RegExp( regexString, 'i');
        const products = await Product.find({ name: { $regex: regex } });
        console.log("products search",products)

        const varify =req.session.user_id
        console.log(varify);
        const id= req.query.id;
        let count = 0;
        console.log("count:",count)
        const cart = await Cart.find({user:varify})
        console.log(cart)
        if(cart.length>0){
            count =  cart[0].products.length;
        }
        const category = await Category.find()


        res.render('searchproducts',{products,varify,category,count});

    } catch (error) {
        res.send(error.msg)
    }
}

const loadsingleproductpage = async(req,res)=>{
    try {
        const varify =req.session.user_id
        console.log(varify);
        const id= req.query.id;
        let count = 0
        const cart = await Cart.find({user:varify})
        console.log(cart)
        if(cart.length>0){
            count =  cart[0].products.length;
        }
        const category = await Category.find()
        const products = await Product.find({_id:id})
        const product = products[0];
        const cartproduct = await Cart.findOne({ user: varify, 'products.product': product._id })
        console.log("products from usercart",cartproduct);

        let isInWishlist = false;
        if (varify) {
            const user = await User.findById(varify);
            isInWishlist = user.wishlist.includes(id);
          }

        res.render('singleproduct2',{varify,category,product,cartproduct,count,isInWishlist});
    } catch (error) {
        res.send(error.msg)
    }
}

const loadedit = async(req,res)=>{
    try {
        
    } catch (error) {
        res.send(error.msg)
    }
}

const getCartItems = async (userId) => {
    try {
        return await Cart.aggregate([
            { $match: { user: userId } },
            { $unwind: '$products' },
            {
                $project: {
                    product: '$products.product',
                    quantity: { $toDouble: '$products.quantity' } // Convert to double if it's stored as a string
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'categories',
                                localField: 'category',
                                foreignField: '_id',
                                as: 'category'
                            }
                        }
                    ],
                    as: 'productinfo'
                }
            },
            {
                $unwind: '$productinfo'
            },
            {
                $addFields: {
                    totalPrice: { $multiply: [{ $toDouble: '$productinfo.price' }, '$quantity'] }
                }
            }
        ]);
    } catch (error) {
        throw error;
    }
};


const loadcart = async (req, res) => {
    try {
      const userid = new ObjectId(req.session.user_id)
  
      const cart = await Cart.findOne({ user: userid });
      let count = '0'
      let totalsum = 0
      let cartitems = '';
      console.log(cart)
      if(cart){
        count =  cart.products.length;
      }
  if(cart){
      
    cartitems = await getCartItems(userid);
     totalsum = cartitems.reduce((sum, item) => sum + item.totalPrice, 0);

 

      console.log('Total Sum:', totalsum);
      console.log('userid:', userid);
      console.log('cart:', cart);
      console.log('cartitems:', cartitems);
      console.log('category:', cartitems[0].productinfo.category);
} 
      res.render('cart',{cartproducts:cartitems,cart,varify:userid,count,totalsum:totalsum});
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
  
  

const addtocart = async(req,res)=>{
    try {
        const productid = req.query.id;
        const Quantity = parseInt(req.query.Quantity);
        const userid = req.session.user_id;
        console.log("id :",productid ,userid)
        const Usercart = await Cart.find({user:userid});
        console.log(Usercart)
        if(Usercart.length>0){
console.log("cart exists")
var newProduct = { product: productid, quantity: Quantity };
const cartdata = await Cart.updateOne({user:userid},{$addToSet:{products:newProduct}});
console.log("cart data",cartdata)
res.redirect(`/singleproduct?id=${productid}`);
        }
        else{
            console.log("cart empty")
            const newProduct = { product: productid, quantity: Quantity };
            console.log("new product",newProduct)
         const newcart =new Cart({
         user:userid,
         products:[newProduct]
        })
const cartdata = await newcart.save();
console.log(cartdata);
// const addtoUser = await User.updateOne({_id:userid},{$set:{cart:cartdata._id}});
// console.log(addtoUser)
res.redirect(`/singleproduct?id=${productid}`);
        }
    } catch (error) {
        
    }
}

const deletecartitem = async(req,res)=>{
    try {
        const productid = new ObjectId(req.query.id);
        console.log("product to delete",productid);

        const userid = new ObjectId(req.session.user_id);
        console.log("user to delete",userid)


            const newcart = await Cart.updateOne({ user: userid }, { $pull: { products: { product: productid } } });
            console.log("cart deleted", newcart);
         
          const Usercart = await Cart.findOne({user:userid});
          console.log("usercart",Usercart)
            if(Usercart.products &&  Usercart.products.length==0){
                const deleteCart = await Cart.deleteOne({user:userid});
               
            }
console.log("out from delete")
        res.redirect('/cart')
    } catch (error) {
        res.send(error.msg)
    }
}

const upQuantity = async  (req,res)=>{
    try {
        console.log("up...............................................")
        const productid = new ObjectId(req.query.id);
        const userid = new ObjectId(req.session.user_id);
        const count = req.query.count
        console.log("user in session",userid)
const upQuantity  = await Cart.updateOne({user:userid,'products.product':productid},{$inc:{'products.$.quantity': count }});

//get total 
const cartitems = await getCartItems(userid);
totalsum = cartitems.reduce((sum, item) => sum + item.totalPrice, 0);

// res.redirect('/cart')
res.json({status:true , total:totalsum });
    } catch (error) {
        res.send(error.msg)
    }
}

const downQuantity = async  (req,res)=>{
try {
    const productid = new ObjectId(req.query.id);
    const userid = new ObjectId(req.session.user_id);
    
const downQuantity =  await Cart.updateOne({user:userid,'products.product':productid},{$inc:{'products.$.quantity': -1 }});
const cartitems = await getCartItems(userid);
totalsum = cartitems.reduce((sum, item) => sum + item.totalPrice, 0);
res.json({status:true , total:totalsum });
} catch (error) {
    res.send(error.msg)
}
}

const useraccount = async (req,res)=>{
    try {
        const varify =req.session.user_id
        console.log(varify);
        let count = 0
        const cart = await Cart.find({user:varify})
        console.log(cart)
        if(cart.length>0){
            count =  cart[0].products.length;
        }
        const category = await Category.find()

        const user = await User.findOne({_id:varify});

        res.render('useraccount',{varify,count,category,user});
    } catch (error) {
        res.send(error.msg)
    }
}

const updateuserdata =async(req,res)=>{
    try {
        console.log(req.body);
        const updateuser = await User.updateOne({_id:req.session.user_id},{$set:{name:req.body.name,gender:req.body.gender,email:req.body.email,mobile:req.body.mobile}});
        console.log("user updated",updateuser);
        res.redirect('/useraccount')
    } catch (error) {
        res.send(error.msg)
    }
}

const loaduseraddress = async (req,res)=>{
    try {
        const varify =req.session.user_id
        console.log(varify);
        let count = 0
        const cart = await Cart.find({user:varify})
        console.log(cart)
        if(cart.length>0){
            count =  cart[0].products.length;
        }
        const category = await Category.find()
        const user = await User.findOne({_id:varify});
        res.render('address',{varify,count,category,user})
    } catch (error) {
        res.send(error.msg)
    }
}

const addaddress = async (req,res)=>{
    try {
        console.log(req.body);
        const userId = req.session.user_id;
        const newAddress=
         {
             
               name:req.body.name,
               mobile:req.body.mobile,
               pincode:req.body.pincode,
               locality:req.body.locality,
               address:req.body.address,
               district:req.body.district,
               state:req.body.state,
               type:req.body.type,

        }
        const updateResult = await User.updateOne(
            { _id: userId },
            { $addToSet: { address: newAddress } }
          ).exec();
         
        console.log(addaddress);
        res.redirect('/address');
    } catch (error) {
         res.send(error.msg)
    }
}

const deleteaddress = async(req,res)=>{
  try {
    const userId = req.session.user_id;
    const addressid =new ObjectId(req.query.id);
    const deleteaddress =await User.updateOne({_id:userId},{$pull:{address:{_id:addressid}}});
    console.log("addressdeleted.",deleteaddress)
    res.redirect('/address');
  } catch (error) {
    res.send(error.msg)
  }
}

const loadeditaddress = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const addressid =new ObjectId(req.query.id);

        const addressDocument = await User.findOne(
            { _id: userId, 'address._id': addressid },
            { 'address.$': 1,_id:0 }
          ).exec();
          console.log("address to edit",addressDocument)
          const address = addressDocument.address[0];
          console.log("address-",address)


          const varify =userId
          console.log(varify);
          let count = 0
          const cart = await Cart.find({user:varify})
          console.log(cart)
          if(cart.length>0){
              count =  cart[0].products.length;
          }
          const category = await Category.find()
          const user = await User.findOne({_id:varify});
          res.render('editaddress',{address,varify,count,user,category});
    } catch (error) {
        res.send(error.msg)
    }
}

const editingaddress = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const addressid =new ObjectId(req.query.id);
        console.log(req.body);
        const newAddress=
        {
            
              name:req.body.name,
              mobile:req.body.mobile,
              pincode:req.body.pincode,
              locality:req.body.locality,
              address:req.body.address,
              district:req.body.district,
              state:req.body.state,
              type:req.body.type,

       }

        const editaddress =  await User.updateOne(
            { _id: userId, 'address._id': addressid },
            { $set: { 'address.$': newAddress } }
          ).exec();
          res.redirect('/address')
    } catch (error) {
        res.send(error.msg)
    }
}


const loadcheckout = async (req,res)=>{
    try {console.log("in checkout page")
        const userId =new ObjectId( req.session.user_id);
        const user = await User.findOne({_id:userId});
console.log("in checkout page")

      let  cartitems = await getCartItems(userId);
       let  totalsum = cartitems.reduce((sum, item) => sum + item.totalPrice, 0);
       const cart = await Cart.findOne({ user: userId });
       console.log("cart=",cart)
         console.log("items=",cartitems)
console.log("sum=",totalsum)

const coupons = await Coupon.find().sort({ _id: -1 });
console.log("coupons",coupons)
let balance = 0;
const userdata = await User.findOne({_id:userId});
if(userdata.wallet){
 balance = user.wallet.balance;
}
        res.render('checkout',{user, totalsum,coupons,balance,varify:req.session.user_id,count:cart.products.length})
    } catch (error) {
        res.send(error.msg)
    }
}

const addaddresscheckout = async (req,res)=>{
    try {
        console.log(req.body);
        const userId = req.session.user_id;
        const newAddress=
         {
             
               name:req.body.name,
               mobile:req.body.mobile,
               pincode:req.body.pincode,
               locality:req.body.locality,
               address:req.body.address,
               district:req.body.district,
               state:req.body.state,
               type:req.body.type,

        }
        const updateResult = await User.updateOne(
            { _id: userId },
            { $addToSet: { address: newAddress } }
          ).exec();
         
        console.log(addaddress);
        res.redirect('/checkout');
    } catch (error) {
         res.send(error.msg)
    }
}

const getproducts = async (orderId) => {
    try {
        return await Order.aggregate([
            { $match: { _id: orderId } }, // Match the order by its ID
            { $unwind: '$products' }, // Unwind the products array

            // Filter out products with Cancelled: false
            { $match: { 'products.Cancelled': { $ne: true } } },

            // Project necessary fields
            {
                $project: {
                    product: '$products.product',
                    quantity: { $toDouble: '$products.quantity' } // Convert to double if it's stored as a string
                }
            },
            // Perform lookup to get product information
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productinfo'
                }
            },
            { $unwind: '$productinfo' }, // Unwind productinfo array
            // Add field totalPrice by multiplying price and quantity
            {
                $addFields: {
                    totalPrice: { $multiply: [{ $toDouble: '$productinfo.price' }, '$quantity'] }
                }
            }
        ]);
    } catch (error) {
        throw error;
    }
};


const checkout = async(req,res)=>{
    try {
        console.log("address to checkout",req.body);
       

        
        const userId = req.session.user_id;
        const addressDocument = await User.findOne(
            { _id: userId, 'address._id':  req.body.deliveryaddress},
            { 'address.$': 1,_id:0 });
            const array = addressDocument.address[0];
            console.log("address document -",addressDocument);
            console.log("address array",array);
           
          const address =  {
             
            name:array.name,
            mobile:array.mobile,
            pincode:array.pincode,
            locality:array.locality,
            address:array.address,
            district:array.district,
            state:array.state,
            type:array.type,

     };

          console.log("document",address)
        const products = await getCartItems(new ObjectId (userId));
        const totalsum = products.reduce((sum, item) => sum + item.totalPrice, 0);
        console.log("total",totalsum);
        // await getCartItems(userId);
        console.log("products going to order",products)
        let status = req.body.paymenttype === 'cod'? 'placed' : req.body.paymenttype === 'wallet'? 'placed' : 'payment failed';
        let paymentstatus = req.body.paymenttype === 'cod'? 'cod' : req.body.paymenttype === 'wallet'? 'wallet' : 'online';
        console.log("going to order")


        const neworder =new Order({
            user:userId, products:products, address: address, paymentstatus: paymentstatus, orderstatus: status , shipping:req.body.shipping , subtotal:totalsum
        })
        if (req.body.couponUsed !== '') {
            neworder.coupon = req.body.couponUsed;
           neworder.total = req.body.total ;
           neworder.discount = req.body.discount;
        }else{
            neworder.total = parseInt(req.body.subtotal)  + parseInt(req.body.shipping ) ;
            neworder.discount = 0;
        }
        const orderdata = await neworder.save();
console.log("ordercreated")
        //decreasing wallet
        if(req.body.paymenttype === 'wallet'){
            var amount = parseInt(orderdata.total)
            walletdetails = {amount: amount , status:'debit',description:'purchased using wallet'};
            const decreasewallet = await  User.updateOne({_id:req.session.user_id},{$inc:{'wallet.balance':-amount},$push:{'wallet.hystory':walletdetails}})
         console.log("wallet balance decreased",decreasewallet)
        }
//decrease stock
        if(orderdata){
            let decreaseQuantity = [];
            const updatePromises = products.map(async (productinfo) => {
                try {
                    console.log("products to update stock", productinfo);
                    const existingProduct = await Product.findById(productinfo.product);
                    const currentStock = Number(existingProduct.stock);
                    const quantity = currentStock - productinfo.quantity;
                    console.log("new quantity",quantity,typeof(quantity))
                    return await Product.updateOne({ _id: productinfo.product }, { $set: { stock: quantity } });
                } catch (error) {
                    console.error("Error updating product:", error);
                    // Handle the error as needed
                    return { error: error.message };
                }
            });
            
            decreaseQuantity = await Promise.all(updatePromises);
            console.log("quantity decreased", decreaseQuantity);
            
        }


        console.log("order -",orderdata);
        //removing cart
        const deleteCart = await Cart.deleteOne({user:userId});

        if( req.body.paymenttype === 'cod' ||  req.body.paymenttype === 'wallet')
        {
        res.json({codSuccess:true});
        }
        else if(req.body.paymenttype === 'online'){
            var options = {
                amount:  neworder.total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderdata._id
              };
              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log("error",err);
                }
                console.log("new online order",order);
                res.json({online:order})
              });
             
        }
    } catch (error) {
        res.send(error.msg)
    }
};

const varifypayment = async(req,res)=>{
    try {
        console.log("payment", req.body);
        const { payment, order } = req.body;
        const addedsignature = payment.razorpay_order_id + "|" + payment.razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_key_secret).update(addedsignature.toString()).digest('hex')
        console.log("expectedSignature",expectedSignature);
        console.log(" razorpay_signature",payment. razorpay_signature)
        // let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_key_secret);
        // hmac.update(order.razorpay_order_id + "|" + payment.razorpay_payment_id);
        // hmac = hmac.digest('hex');
        // console.log("code", hmac);
    
        if (expectedSignature == payment.razorpay_signature) {
          console.log("payment successful");

          const updateStatus =await Order.updateOne({_id:order.receipt},{$set:{orderstatus:"placed"}});
          console.log("updated result",updateStatus)
          res.json({ status: true });
        } else {
          throw new Error('Payment failed');
        }
      } catch (error) {
        console.error(error.message);
        res.json({ status:false,err: error.message });
      }
}

const ordersuccess = async(req,res)=>{
    try {
        res.render('ordersuccess');
    } catch (error) {
        res.send(error.msg)
    }
}



const loadorder = async(req,res)=>{
    try {
        const varify =req.session.user_id
        console.log(varify);
        let count = 0;
        console.log(count)
        const cart = await Cart.find({user:varify});
        if(cart.length==1){
            console.log("in count")
          count =  cart[0].products.length;
          console.log("after count")
        }
        const category = await Category.find()
        console.log("getting data")
       
            const orderData = await Order.find({user:varify}).sort({ _id: -1 });
            console.log("order data",orderData);
         
        res.render("order",{varify,count,category,orderData})

    } catch (error) {
        res.send(error.msg)
    }
}

const loadorderproducts = async (req,res)=>{
    try {
        console.log("in order product")
        const varify =req.session.user_id
        console.log(varify);
        let count = 0;
        console.log(count)
        const cart = await Cart.find({user:varify});
        if(cart.length==1){
            console.log("in count")
          count =  cart[0].products.length;
          console.log("after count")
        }
        const category = await Category.find()
        console.log("getting data")

        const orderId = req.query.id;
        console.log(orderId);
        const orderData = await Order.findOne({_id:orderId});
        console.log("order data -",orderData);
        res.render('orderproducts',{varify,count,category,orderData})
    } catch (error) {
        res.send(error.msg)
    }
}

const deleteorderproduct = async (req,res)=>{
    try {
        console.log(req.query)
        const productId = req.query.id;
        const orderId = req.query.orderid;
        const deleteProduct = 
                      await Order.updateOne({_id:orderId,'products.product':productId},{ $set: { 'products.$.Cancelled': true } });
        console.log(deleteProduct);

        //getting new total
        const orderdetails = await Order.findOne({_id:orderId});
        const sumArray = orderdetails.products.map(product => {
            if (!product.Cancelled && product.productinfo && product.productinfo.price) {
              return product.quantity * product.productinfo.price;
            } else {
              return 0;
            }
          });
        console.log("productlist -" ,sumArray);
     
        const totalsum = sumArray.reduce((sum, price) => sum + price, 0);
        console.log("total",totalsum);
     

        //adding new total to order data
        const addtotal = await Order.updateOne({_id: orderId },{$set:{total:totalsum}});
console.log("after adding new total",addtotal)
//adding productamount to wallet 
const productToCalculate = orderdetails.products.find(product => product.product.equals(new ObjectId(productId)));
const amount = productToCalculate.quantity * productToCalculate.productinfo.price;
walletdetails = {amount: amount , status:'credit',description:' product cancelled from order'};
const increasewallet = await  User.updateOne({_id:req.session.user_id},{$inc:{'wallet.balance':-amount},$push:{'wallet.hystory':walletdetails}})
console.log("wallet balance increased",increasewallet)
       
      
 res.json("Cancelled")
        // res.redirect(`/orderproducts?id=${orderId}`)
    } catch (error) {
        res.send(error.msg)
    }
}

const cancelorder = async (req,res)=>{
    try {
        console.log('in cancel order');
        console.log(req.body)
        const orderid = req.body.orderid;
        const cancelreason = req.body.cancelReason;

        const order = await Order.findOne({_id: orderid});
        console.log("order to cancel",order)
        const amount  = order.total;
        const peymentmethod = order.paymentstatus;
        const status = order.orderstatus;
        //adding money to wallet
        walletdetails = {amount: amount, status:'credit',description:'cancelled order'};
        if(peymentmethod ==="online" && status !=='payment failed' || peymentmethod ==="wallet"){
        const addwallet = await User.updateOne({_id:req.session.user_id},{$inc:{'wallet.balance':amount},$push:{'wallet.hystory':walletdetails}})
        } 
        //changing the status to cancelled
      const  cancelorder = await Order.updateOne({_id: orderid},{$set:{orderstatus:'cancelled',cancelreason:cancelreason}});
        console.log("cancelled order",cancelorder);
      
        res.redirect(`/orderproducts?id=${orderid}`)

    } catch (error) {
        res.send(error.msg)
    }
}

const returnorder = async (req,res)=>{
    try {
        console.log('in return order');
        console.log(req.body)
        const orderid = req.body.orderid;
        const amount  = req.body.total;
        const returnreason = req.body.returnReason;
        //changing the status to cancelled
      const  cancelorder = await Order.updateOne({_id: orderid},{$set:{orderstatus:'return requested',returnreason:returnreason}});
        console.log("cancelled order",cancelorder);
        // walletdetails = {amount: amount, status:'credit',description:'returned order'};
        // const addwallet = await User.updateOne({_id:req.session.user_id},{$inc:{'wallet.balance':amount},$push:{'wallet.hystory':walletdetails}})
    
        // res.redirect(`/orderproducts?id=${orderid}`)
        res.json({status:"Return requested"});

    } catch (error) {
        res.send(error.msg)
    }
}

const loadchangepassword = async(req,res)=>{
    try {
        const varify =req.session.user_id
        console.log(varify);
        let count = 0;
        console.log(count)
        const cart = await Cart.find({user:varify});
        if(cart.length==1){
            console.log("in count")
          count =  cart[0].products.length;
          console.log("after count")
        }
        const user = await User.findOne({_id:varify});
let data = '',errors=[];
console.log("is query ",req.query)
   if(req.query.data)
   {
    console.log("in data")
data = req.query.data;
   }

   if(req.query.errors){
    console.log("in errors")
    errors = JSON.parse(req.query.errors).errors;
    console.log(typeof errors)
    console.log(errors)
   }

        res.render('changepassword',{varify,count,cart,user,data,errors});
    } catch (error) {
        res.send(error.msg) 
    }
}

const changepassword = async(req,res)=>{
    try {
        console.log(req.body);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
           let  error = JSON.stringify(errors);
             console.log("first errors",error)
            res.redirect('/changepassword?errors='+error)
           
            return;
        }

        const user = await User.findOne({_id:req.session.user_id});
        console.log("current password",user.password)
        const passwordmatch = await bcrypt.compare(req.body.password,user.password);
        console.log("password matched - ",passwordmatch)
        let data ="";
    if(passwordmatch){
        console.log("password match");
        const password = req.body.comformpassword;
        console.log("new password ",password)
        const hpassword = await bcrypt.hash(password,10);
   console.log("Hashed Password:", hpassword);
   const insertnewpassword = await User.updateOne({_id:req.session.user_id},{$set:{password:hpassword}});
   console.log("password changed",insertnewpassword);
 data = "password changed successfully !"
         res.redirect('/changepassword?data='+data) 
    }
    else{
        console.log("password not match");
        data = "password doesn't match !"
         res.redirect('/changepassword?data='+data) 

    }
    } catch (error) {
        res.send(error.msg) 
    }
}

const loadwishlist = async (req,res)=>{
    try {
        console.log("in wishlist")
        const userid = req.session.user_id;
        const cart = await Cart.findOne({ user: userid });
      let count = '0'
      console.log(cart)
      if(cart){
        count =  cart.products.length;
      }
      let user = await User.findOne({_id:userid});
      console.log("userdata",user)
      let  wishlist= [];

      if ( user.wishlist.length >= 0) {
        const wishlistProducts = await Product.find({ _id: { $in: user.wishlist } });
        console.log("products",wishlistProducts);
        wishlist=wishlistProducts;
      }
      console.log("wishlist",wishlist);
     
      res.render('wishlist',{varify:userid,count,wishlist})
    } catch (error) {
        res.send(error.msg) 
    }
}

const addwishlist = async (req,res)=>{
    try {
        const userid = req.session.user_id;
        const productid = req.query.id;
        let user = await User.findOne({_id:userid});
        console.log("userdata",user)
       
           if(user.wishlist){
            const index = user.wishlist.indexOf(productid);
            console.log("product found",index)
            if (index === -1) {
                console.log("product not exist")
        const addproduct = await User.updateOne(
            { _id: userid },
            { $push: { wishlist: productid } }
          ).exec();
          console.log("added",addproduct)
        }else {
            console.log("product  exist")
            // If already in the wishlist, remove the product ID
            const deleteproduct = await User.updateOne(
                { _id: userid },
                { $pull: { wishlist: productid } }
              ).exec();
              console.log("deleted",deleteproduct)
          }
        }
        console.log("out adding")
        res.redirect('/singleproduct?id='+productid);
      
    } catch (error) {
        res.send(error.msg) 
    }
}

const deletewishlistitem =async (req,res)=>{
    try {
        console.log("deletewishitem")
        const userid =req.session.user_id;
        const productid = req.query.id;
        const deleteproduct = await User.updateOne(
            { _id: userid },
            { $pull: { wishlist: productid } }
          ).exec();
          console.log("deleted",deleteproduct);
          res.redirect('/wishlist');
    } catch (error) {
        res.send(error.msg)
    }
}

const loadwallet = async (req,res)=>{
    try {
        const varify =req.session.user_id
        console.log(varify);
        let count = 0
        const cart = await Cart.find({user:varify})
        console.log(cart)
        if(cart.length>0){
            count =  cart[0].products.length;
        }
        const category = await Category.find()
        let balance = 0;
        const user = await User.findOne({_id:varify});
        if(user.wallet){
         balance = user.wallet.balance;
    }
        res.render('wallet',{varify,count,category,user,balance});
    } catch (error) {
        res.send(error.msg)
    }
}


const loadallproducts = async (req, res) => {
    try {
        const varify = req.session.user_id;
        console.log(varify);

        let count = 0;
        console.log("count:", count);

        // Filter parameters from request
        const { category, brand, minPrice, maxPrice, sort } = req.query;
        const filterQuery = { status: "published" };

        // Apply filters if they exist
        if (category) {
            filterQuery.category = category;
        }
        if (brand) {
            filterQuery.company = brand;
        }
        const priceRanges = [];
        console.log("minPrice",minPrice);
        console.log("maxPrice",maxPrice);
        console.log(typeof(minPrice),"type")
        if (minPrice && maxPrice) {
         if(typeof(minPrice)==="object"){
            for (let i = 0; i < minPrice.length; i++) {
                const priceRangeCondition = {
                    price: {
                        $gte: minPrice[i],
                        $lte: maxPrice[i]
                    }
                };
                priceRanges.push(priceRangeCondition);
            }
            filterQuery.$or = priceRanges;
        }else{
            filterQuery.price =  { $gte: minPrice, $lte: maxPrice };
        }
        }
        // Prepare sort criteria
        let sortCriteria = {};
        if (sort === 'asc') {
            sortCriteria.price = 1; // Sort by price ascending
        } else if (sort === 'desc') {
            sortCriteria.price = -1; // Sort by price descending
        }else if (sort === 'new') {
            sortCriteria._id= -1; // Sort by price descending
        }

        console.log("sort",sortCriteria)
        const cart = await Cart.find({ user: varify });
        console.log(cart);
        if (cart.length > 0) {
            count = cart[0].products.length;
        }
        
        // Query database with filters and sorting criteria
        const categoryData = await Category.find();
        const brandData = await Company.find();
        console.log("query",filterQuery);
        console.log("priceRanges",priceRanges)
        const productData = await Product.find(filterQuery).sort(sortCriteria);
console.log("product",productData);

        res.render('allproducts', { varify, category: categoryData, product: productData, count, brand: brandData ,query:req.query});
    } catch (error) {
        res.send(error.message);
    }
};
const getrefferalcode = async (req,res)=>{
    try {
        console.log("hii");
        const id= req.query.id;
        const refferal = Math.random().toString(36).substring(2, 8).toUpperCase();
        console.log(refferal); 

       const addrefer= await User.updateOne({ _id: id }, {$set:{referralCode: refferal}  });
    
       console.log(addrefer)
       res.status(200).json({ referralCode: refferal });
    } catch (error) {
        res.send(error.msg)
    }
}


const userlogout = async (req,res)=>{
    try {
        req.session.user_id = undefined;
        res.redirect('/');
    } catch (error) {
        res.send(error.msg)
    }
}


module.exports={insertUser,loadSignup,loadLogin,varifylogin,loadhome,userlogout,loadedit,varifyotp,loadotp,loadproductpage,loadsingleproductpage,resendotp,loadcart,addtocart,deletecartitem,upQuantity,downQuantity,useraccount,updateuserdata
    ,addaddress, loaduseraddress,deleteaddress,loadeditaddress,editingaddress,loadcheckout,addaddresscheckout,checkout,loadorder,loadorderproducts,deleteorderproduct,cancelorder,changepassword,loadchangepassword,returnorder,autocomplete,
    productSearch,loadwishlist,addwishlist,deletewishlistitem,ordersuccess,varifypayment,loadwallet,loadallproducts,getrefferalcode,loadforgotpassword,forgotpassword,loadvarifyforgotpassword,varifyforgotpassword,addforgotpassword,
}