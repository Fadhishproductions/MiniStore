const express = require('express');
const router = express();

const upload = require('../middlewares/multer')

router.set('view engine','ejs');
router.set('views','./views/admin');

const admin = require('../controllers/admincontroller');
const Coupon = require('../controllers/couponcontroller');
const auth = require('../middlewares/adminauth');

//static pages
router.use(express.static("public"));

//admin login router
router.get('/',auth.islogout,admin.loadlogin);
router.post('/',admin.varifylogin);

//admin home router
router.get('/home',auth.islogin,admin.loadhome);

//logout router
router.get('/logout',auth.islogin,admin.logout);

//blockuser route
router.get('/block',auth.islogin,admin.blocked);

//unblockuser
router.get('/unblock',auth.islogin,admin.unblock)

//delete product
router.get('/deleteproduct',auth.islogin,admin.deleteproduct)

//delete category
router.get('/deletecategory',auth.islogin,admin.deletecategory);

//delete company
router.get('/deletecompany',auth.islogin,admin.deletecompany);

//addcompany
router.get('/addcompany',auth.islogin,admin.loadaddcompany);
router.post('/addcompany',admin.addingcompany)
router.post('/company/addcategory',admin.addcompanycategory)
//add category route
router.get('/addcategory',auth.islogin,admin.loadaddcategory);
router.post('/addcategory',admin.addingcategory)

//category route
router.get('/category',auth.islogin,admin.loadcategory)
//edit category
router.get('/editcategory',auth.islogin,admin.editcategory);
router.post('/editcategory',admin.editingcategory);

//company route
router.get('/company',auth.islogin,admin.loadcompany)


//editcompany
router.get('/editcompany',auth.islogin,admin.editcompany);
router.post('/editcompany',admin.editingcompany);
//product route
router.get('/product',auth.islogin,admin.loadproduct);

//addproduct route
router.get('/addproduct',auth.islogin,admin.loadaddproduct);
router.post('/addproduct',upload.array('images', 4),admin.addingproduct);

//edit product route
router.get('/editproduct',auth.islogin,admin.loadeditproduct)
router.post('/editproduct',upload.array('images', 4),admin.editingproduct)

//delete productimage
router.get('/deleteimage',auth.islogin,admin.deleteimage)
//loaduser
router.get('/user',auth.islogin,admin.loaduser)

//publish product 
router.get('/notpublished',admin.draftproduct)

//draft product
router.get('/published',admin.publishproduct)

//order page
router.get('/order',auth.islogin,admin.loadorder)

//cancel order
router.get('/cancelorder',auth.islogin,admin.cancelorder)

//load orderproducts
router.get('/orderproducts',auth.islogin,admin.loadorderproducts)

//load return requests
router.get('/returnrequest',auth.islogin,admin.loadreturnrequest)

//acceptreturnrequest
router.post('/acceptreturnrequest',auth.islogin,admin.acceptreturnrequest)
//update orderstatus
router.post('/orderstatusupdate',auth.islogin,admin.orderstatusupdate);

//delete product from order
router.get('/deleteorderproduct',auth.islogin,admin.deleteorderproduct);

//coupon page
router.get('/coupon',auth.islogin,Coupon.loadcoupon)

//add coupon
router.get('/addcoupon',auth.islogin,Coupon.addcoupon);
router.post('/addcoupon',auth.islogin,Coupon.addingcoupon);

//validate coupon
router.get("/validcoupon",auth.islogin,Coupon.validatecoupon)

//invalidate coupon
router.get("/invalidcoupon",auth.islogin,Coupon.invalidatecoupon)

//edit coupon
router.get("/editcoupon",auth.islogin,Coupon.editcoupon);
router.post("/editcoupon",auth.islogin,Coupon.editingcoupon);

//salesreport
router.get("/salesreport",auth.islogin,admin.salesreport)

//offerproduct
router.post("/addoffer",auth.islogin,admin.addofferproduct);
//removeproductoffer
router.post("/removeoffer",auth.islogin,admin.removeofferproduct);

//categoryoffer
router.post("/addcategoryoffer",auth.islogin,admin.addoffercategory)
//removecategoryoffer
router.post("/removecategoryoffer",auth.islogin,admin.removeoffercategory)

router.get('/getCategories',admin.companygetcategory);

module.exports = router;


