const express = require('express');
const router = express();
const bcrypt = require('bcrypt');
const validator = require('../middlewares/validation');
const { check, validationResult } = require('express-validator');
const User = require('../controllers/usercontroller');
const Coupon = require('../controllers/couponcontroller');
const auth = require('../middlewares/auth');





router.set('view engine', 'ejs');
router.set('views', './views/users');



//static pages
router.use(express.static("public"));
// signup router
router.get('/signup/',auth.islogout, User.loadSignup);
router.post('/signup', validator.uservalidator, User.insertUser);

//login router
router.get('/login',auth.islogout,User.loadLogin)
router.post('/login',User.varifylogin)

//otp varify
router.get('/varifyotp',auth.islogout,User.loadotp)
router.post('/varifyotp',auth.islogout,User.varifyotp)

//resend otp router
router.get('/resendotp',auth.islogout,User.resendotp)

//landingpage router
router.get('/',User.loadhome)


//logout router
router.get('/logout',auth.islogin,User.userlogout)

//fotgotpassword
router.get('/forgotpassword',auth.islogout,User.loadforgotpassword);
router.post('/forgotpassword',auth.islogout,User.forgotpassword);
router.get('/varifyforgotpassword',auth.islogout,User.loadvarifyforgotpassword)
router.post('/varifyforgotpassword',auth.islogout,User.varifyforgotpassword)
router.post('/addforgotpassword',auth.islogout,validator.validatePassword,User.addforgotpassword)
//home router
router.get('/home',auth.islogin,User.loadhome);

//autocomplete search
router.get('/autocomplete',User.autocomplete);

//search product
router.post('/search',User.productSearch)

//productspage
router.get('/categoryproducts',auth.is_blocked,User.loadproductpage)

//singleproduct page
router.get('/singleproduct',auth.is_blocked,User.loadsingleproductpage)

//wishlist
router.get('/wishlist',auth.is_blocked,auth.islogin,User.loadwishlist)

//addwishlist
router.get('/addwishlist',auth.islogin,User.addwishlist)

//delete wishlist item
router.get('/deletewishlistitem',auth.islogin,User.deletewishlistitem)

//load cart
router.get('/cart',auth.is_blocked,auth.islogin,User.loadcart)

//addtocart
router.get('/addtocart',auth.islogin,User.addtocart)

//deletecartitem
router.get('/deletecartitem',auth.islogin,User.deletecartitem)

//increase cartitem quantity
router.get('/UpCartitem',auth.islogin,User.upQuantity);

//decrease cartitem quantity
router.get('/downCartitem',auth.islogin,User.downQuantity);

//useraccount
router.get('/useraccount',auth.is_blocked,auth.islogin,User.useraccount);

//update userdata
router.post('/userdata',auth.islogin,User.updateuserdata);

//change user password
router.get('/changepassword',auth.islogin,User.loadchangepassword)
router.post('/changepassword',auth.islogin,validator.validatePassword,User.changepassword)

//loading address page route
router.get('/address',auth.is_blocked,auth.islogin,User.loaduseraddress);

//adding new address 
router.post('/addaddress',auth.islogin,User.addaddress);

//adding new address from checkout
router.post('/addaddresscheckout',auth.islogin,User.addaddresscheckout)

//delete address
router.get('/deleteaddress',auth.islogin,User.deleteaddress)

//edit address
router.get('/editaddress',auth.islogin,User.loadeditaddress);
router.post('/editaddress',auth.islogin,User.editingaddress)

//checkout page
router.get('/checkout',auth.is_blocked,auth.islogin,User.loadcheckout)
router.post('/checkout',auth.islogin,User.checkout);

//successorder
router.get('/ordersuccess',auth.is_blocked,auth.islogin,User.ordersuccess);

//varify payment
router.post("/varifypayment",auth.islogin,User.varifypayment)

//order page
router.get('/orders',auth.is_blocked,auth.islogin,User.loadorder)

//order products
router.get('/orderproducts',auth.is_blocked,auth.islogin,User.loadorderproducts)

//delete product from product
router.get('/deleteorderproduct',auth.islogin,User.deleteorderproduct)

//cancel order
router.post('/cancelorder',auth.islogin,User.cancelorder);

//return order
router.post('/returnorder',auth.islogin,User.returnorder)

//wallet
router.get('/wallet',auth.islogin,User.loadwallet)

//apply coupon 
router.get("/applycoupon",auth.islogin,Coupon.applycoupon)

//ger refferal offer
router.get('/getRefferalCode',auth.is_blocked,auth.islogin,User.getrefferalcode)

//all products
router.get("/allproducts",User.loadallproducts)
// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

module.exports = router;
