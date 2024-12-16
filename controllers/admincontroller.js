const User = require('../models/usermodel');
const Product = require('../models/productmodel');
const Category = require('../models/categorymodel');
const Company = require('../models/companymodel');
const bcrypt = require('bcrypt');
const Order = require('../models/ordermodel')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const loadlogin = async (req,res)=>{
    try {
        data=""
      res.render('login',{data})
    } catch (error) {
       res.send(error.msg) 
    }
}

const varifylogin = async(req,res)=>{
    try {
        console.log(req.body)
        const email = req.body.email;
        const password = req.body.password;
        console.log(password)
        const admin= await User.findOne({email:email});
        console.log(admin);
        const hpassword = await bcrypt.compare(password,admin.password);
        console.log(hpassword)
        
        if(admin.is_admin==1)
        {

            if(hpassword){
                req.session.admin_id=admin._id;
                res.redirect('/admin/home');
            }
            else{
                data="password is incorrect"
                res.render('login',{data}); 
            }
        }else{
            console.log("not found ");
                data="enter valid email"
        res.render('login',{data});
        }
    } catch (error) {
        res.send(error.msg)
    }
}

const loadhome = async(req,res)=>{
    try {
   const sales = await Order.find({orderstatus:'completed'});
   const dates = sales.map(sales=>{ 
    // Parse the date string into a moment object
    const date_object = moment(sales.orderdate, 'DD/MM/YYYY');
    return  new Date(date_object)
    });
    const salesprice = sales.map(sales=>{return sales.total});
   console.log("sales",sales)
   console.log("dates",dates);
   const category = await Category.find();
   const products = await Product.find();
   const users = await User.find({is_admin:0});
   const orders = await Order.find({ orderstatus: { $in: ['completed','shipped','placed'] } });
//    const listforstatus = await Order.find();
//    const orderstatus = listforstatus.map(order => order.orderstatus);
        res.render('home',{sales,dates,salesprice,category,products,users,orders});
    } catch (error) {
        res.send(error.msg)
    }
}

const loaduser = async(req,res)=>{
    try {
        const users = await User.find({is_admin:0});
        console.log(users);
        res.render('user',{users});
    } catch (error) {
        res.send(error.msg)
    }
}

const logout = async(req,res)=>{
    try {
        req.session.admin_id=undefined;
        res.redirect('/admin');
    } catch (error) {
        res.send(error.msg)
    }
}

//edit user
const loadeditproduct = async(req,res)=>{
    try {
        const productid = req.query.id;
        console.log(productid)
        const product = await Product.findOne({_id:productid});
        console.log(product)
        const category = await Category.find();
        const company =await Company.find();
        res.render('editproduct',{product,category,company});
    } catch (error) {
        res.send(error.msg)
    }
}

const editcategory = async (req,res)=>{
try {
    const data="";
    const categoryid = req.query.id;
    const category = await Category.findOne({_id:categoryid});
    res.render('editcategory',{category,data})
} catch (error) {
    res.send(error.msg)
}
}

const editcompany =async (req,res)=>{
    try {
        const companyid = req.query.id;
        const data = ""
        const company = await Company.findOne({_id:companyid});
        res.render('editcompany',{company,data})
    } catch (error) {
        res.send(error.msg)
    }
}

const editingproduct = async(req,res)=>{
    console.log(req.body);
    try {
        
        console.log("editing",req.body)
        const { name, price, category, company, stock, status, description,productid } = req.body;
        console.log("id of product",req.body.id)
        const imgFiles = req.files;
        const processedImages = await Promise.all(req.files.map(async(file) => {
            const originalFileName = file.originalname;
            const croppedImageBuffer = await sharp(file.path)
            .resize({ width: 679, height: 679})  // Resize the image
                .toBuffer(); // Convert to buffer
        
            const filename = path.basename(originalFileName);
            const timestamp = Date.now();
            const filenameWithDate = `${timestamp}_${filename}`;
        
            const croppedImagePath = path.join(__dirname, '../public/cropped_images', filenameWithDate);
            fs.writeFileSync(croppedImagePath, croppedImageBuffer);
        
            return filenameWithDate;
        }));
        const images =  processedImages.map((file) =>`cropped_images/${file}`);
    //  const deleteimage = await Product.updateOne({_id:req.body.id},{$set:{img:[]}});
    const addimages = await Product.updateOne({_id:req.body.id},{$push:{img:{$each:images}}})
       const product =  await  Product.updateOne({_id:req.body.id},{$set:{name:req.body.name.toUpperCase() , price:req.body.price , category:req.body.category , company:req.body.company , stock:req.body.stock , status:req.body.status , description:req.body.description,}})
        console.log("edited product",product)
        res.redirect('/admin/product')
    } catch (error) {
        res.send(error.msg)
    }
}


const editingcategory = async(req,res)=>{
    try {
        console.log(req.body)
        const id = req.body.id;
        const name = req.body.name.toUpperCase();
        const check = await Category.find({$and:[{_id:{$ne:id}},{name:name}]});
        console.log(check)
        if(check.length==0){
        const category = await Category.updateOne({_id:id},{$set:{name:name , description:req.body.description}});
        console.log(category)
        res.redirect('/admin/category')
        }else{
            const data=`Category in ${name} name exists !`;
            const categoryid = id;
            const category = await Category.findOne({_id:categoryid});
            res.render('editcategory',{category,data})
        }
    } catch (error) {
        
    }
}
const editingcompany = async(req,res)=>{
    try {
        console.log(req.body)
        const id = req.body.id;
        const name = req.body.name.toUpperCase();
        const check = await Company.find({_id:{$ne:id},name:name});
        console.log(check)
        if(check.length==0){
        const company = await Company.updateOne({_id:id},{$set:{name:name, description:req.body.description}});
        console.log(company)
        res.redirect('/admin/company')
        }
        else{
            const data =`${name} company name exists !`;
            const companyid = id;
            const company = await Company.findOne({_id:companyid});
            res.render('editcompany',{company,data})

        }
    } catch (error) {
        
    }
}

 
const blocked = async(req,res)=>{
    try {
        const userid = req.query.id;
        const deleting = await User.updateOne({_id:userid},{$set:{is_blocked:1}});
        res.redirect('/admin/user');
    } catch (error) {
        res.send(error.msg)
    }
}
const unblock = async(req,res)=>{
    try {
        const userid = req.query.id;
        const blocking = await User.updateOne({_id:userid},{$set:{is_blocked:0}});
        res.redirect('/admin/user');
    } catch (error) {
        res.send(error.msg)
    }
}


const draftproduct =async(req,res)=>{
    try {
        const productid = req.query.id;
        const draft = await Product.updateOne({_id:productid},{$set:{status:"draft"}})
        console.log(draft)
        res.redirect('/admin/product');
    } catch (error) {
        res.send(error.msg)
    }
}

const publishproduct =async(req,res)=>{
    try {
        const productid = req.query.id;
        const publish = await Product.updateOne({_id:productid},{$set:{status:"published"}})
        console.log(publish);
        res.redirect('/admin/product');
    } catch (error) {
        res.send(error.msg) 
    }
}

const deletecategory = async (req,res)=>{
    try {
        const categoryid = req.query.id;
        const deleting = await Category.deleteOne({_id:categoryid});
        res.redirect('/admin/category');
    } catch (error) {
        res.send(error.msg)
    }
}
const deletecompany = async (req,res)=>{
    try {
        const companyid = req.query.id;
        const deleting = await Company.deleteOne({_id:companyid});
        res.redirect('/admin/company');
    } catch (error) {
        res.send(error.msg)
    }
}
const deleteproduct = async (req,res)=>{
    try {
        const productid = req.query.id;
        const deleting = await Product.deleteOne({_id:productid});
        res.redirect('/admin/product');
    } catch (error) {
        res.send(error.msg)
    }
}

const deleteimage = async (req,res)=>{
    try {
        const productid = req.query.id;
        const image = req.query.image;
        const pullimage = await Product.updateOne({_id:productid},{ $pull: { img:image } });
        res.redirect(`/admin/editproduct?id=${productid}`);
    } catch (error) {
        res.send(error.msg)
    }
}



const loadaddcategory = async(req,res)=>{
try {
    const data = ""
    res.render('addcategory',{data});
} catch (error) {
    res.send(error.msg)
}
}

const addingcategory = async(req,res)=>{
try {
    console.log(req.body)
    const name = req.body.name.toUpperCase();
    console.log(name)
    const description = req.body.description;
    const check = await Category.find({name});
    console.log(check)
    if(check.length===0)
    {
   const category =new Category({name:name,description:description});
   const categorydata =await category.save();
  
  res.redirect('/admin/category');
   }
  else{
    const data = "Catogory exists in this name"
    res.render('addcategory',{data});
  }
} catch (error) {
    res.send(error.msg)
}   
}

const loadaddcompany = async(req,res)=>{
    try {data =""
        res.render('addcompany');
    } catch (error) {
        res.send(error.msg)
    }
    }
    
    const addingcompany = async(req,res)=>{
    try {
        console.log(req.body)
        const name = req.body.name.toUpperCase();
        const description = req.body.description;
        const check = await Company.find({name})
        if(check.length==0){
       const category =new Company({name:name,description:description});
       const categorydata =await category.save();
       res.status(200).json({message:'category added'})
      res.redirect('/admin/company');
        }else{
            data =`${name} name is exists !`
        res.render('addcompany');
        }
    } catch (error) {
        res.send(error.msg)
    }
        
    }
    const addcompanycategory = async (req,res)=>{
    try {
    console.log(req.body);
    const category = req.body.category;
    const companyid = req.body.companyid;
    console.log("category",category);
    if(req.body.category){
      let add =    await Company.updateOne({_id:companyid},{$set:{category:category}});
    }
    else{
        add =    await Company.updateOne({_id:companyid},{$set:{category:[]}});
    }
    res.json(add);
    } catch (error) {
    res.send(error.msg)
    }
    }

    const loadcategory = async (req,res)=>{
    
            try {
                const category =await Category.find();
                res.render('category',{category});
            } catch (error) {
                res.send(error.msg)
            }
      
    }
    const loadcompany= async (req,res)=>{
   
            try {
                const company =await Company.find();
                const category = await Category.find();
                res.render('company',{company,category});
            } catch (error) {
                res.send(error.msg)
            }
      
    }

    const loadproduct = async (req,res)=>{
        try {console.log("loading products start");
            const products = await Product.find().populate('category company');
            console.error(products);
            if (products.length === 0) {
                console.log("No products");
              }
            console.log(products)
            res.render('product',{products});
        } catch (error) {
            res.send(error.msg)
        }
    }

    const loadaddproduct = async (req,res)=>{
        try {
            const category = await Category.find();
            const company =await Company.find();
            res.render('addproduct',{category,company,old:''});
        } catch (error) {
            res.send(error.msg)
        }
    }








const addingproduct = async (req, res) => {
  try {
    const { name, price, category, company, stock, status, description } = req.body;
    
    console.log(name, price, category, company, stock, status, description);
   
    if(price>0){
    const imgFiles = req.files;
    console.log(req.files,"files from multer")
    const processedImages = await Promise.all(req.files.map(async(file) => {
        const originalFileName = file.originalname;
        const croppedImageBuffer = await sharp(file.path)
        .resize({ width: 679, height: 679})  // Resize the image
            .toBuffer(); // Convert to buffer
    
        const filename = path.basename(originalFileName);
        const timestamp = Date.now();
        const filenameWithDate = `${timestamp}_${filename}`;
    
        const croppedImagePath = path.join(__dirname, '../public/cropped_images', filenameWithDate);
        fs.writeFileSync(croppedImagePath, croppedImageBuffer);
    
        return filenameWithDate;
    }));
    // Create a new product instance
    const newProduct = new Product({
      name: name,
      price: price,
      category: category,
      company: company,
      stock: stock,
      status: status,
      description: description,
      img: processedImages.map((file) =>`cropped_images/${file}`),
    });
console.log(req.files);

   
   const productdata =  await newProduct.save();
   console.log(productdata)

    // Redirect to the product page
    res.redirect('/admin/product');
}
else{
    const data = "The price have to above 0 !";
    const category = await Category.find();
            const company =await Company.find();
            const old ={name: req.body.name, price:req.body.price,company:req.body.company,category:req.body.category, stock:req.body.stock, description:req.body.description}
            console.log("old",old)
            res.render('addproduct',{category,company,data,old:{name: req.body.name, price:req.body.price,company:req.body.company,category:req.body.category, stock:req.body.stock, description:req.body.description ,status:req.body.status,image: req.files}});
}


  } catch (error) {
    res.status(500).send(error.message);
  }
};

const cancelorder = async (req,res)=>{
    try {
        console.log('in cancel order')
        const orderid = req.query.id;
        //changing the status to cancelled
      const  cancelorder = await Order.updateOne({_id: orderid},{orderstatus:'cancelled'});
        console.log("cancelled order",cancelorder)
        res.redirect('/admin/order');

    } catch (error) {
        res.send(error.msg)
    }
}


const loadorder = async (req, res) => {
    try {
        const orderData = await Order.find().sort({_id:-1});
        const returnrequests = await Order.find({orderstatus:'return requested'});
        const requestno = returnrequests.length;
        console.log(returnrequests,requestno)
        // console.log("order data",orderData);
        res.render('order',{orderData,requestno})
    } catch (error) {
        res.send(error.message);
    }
}
const getproducts = async (orderId) => {
    try {
        return await Order.aggregate([
            { $match: { _id: orderId ,  } },
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

const loadorderproducts = async (req,res)=>{
    try {
        console.log("in order product")
        

        const orderId = req.query.id;
        console.log(orderId);
        const orderData = await Order.findOne({_id:orderId});
        console.log("order data -",orderData);
        const productitems = await getproducts(new ObjectId (orderId));
        console.log("productlist -" ,productitems);
        res.render('orderproducts',{productitems,orderData})
    } catch (error) {
        res.send(error.msg)
    }
}

const orderstatusupdate =  async (req,res)=>{
try {
    console.log(req.body);
    const orderid = req.body.orderid;
    const status = req.body.status;
    const  cancelorder = await Order.updateOne({_id: orderid},{orderstatus: status});
    console.log("cancelled order",cancelorder);
    res.redirect(`/admin/orderproducts?id=${orderid}`)
} catch (error) {
    res.send(error.msg)
}
}

const deleteorderproduct = async (req,res)=>{
    try {
        const productId = req.query.id;
        const orderId = req.query.orderid;
        const deleteProduct = await Order.updateOne({_id:orderId},{$pull:{products:{product:productId}}});
        console.log(deleteProduct);

        //getting new total
        const productitems = await getproducts(new ObjectId(orderId));
        console.log("productlist -" ,productitems);
     
        const totalsum = productitems.reduce((sum, item) => sum + item.totalPrice, 0);
        console.log("total",totalsum);
     

        //adding new total to order data
        const addtotal = await Order.updateOne({_id: orderId },{$set:{total:totalsum}});
console.log("after adding new total",addtotal)
        //cancel order if product empty
        const order =await Order.findOne({_id:orderId});
        if(order.products.length==0){
            const  cancelorder = await Order.updateOne({_id: orderId},{orderstatus:'cancelled'});
            console.log("cancelled order",cancelorder)
        }

        res.redirect(`/admin/orderproducts?id=${orderId}`)
    } catch (error) {
        res.send(error.msg)
    }
}

const salesreport = async (req,res)=>{
    try {
    var startDate = '';
    var endDate = '';
    
    // Function to format date from YYYY-MM-DD to DD/MM/YYYY
    function formatDate(dateString) {
        // if (!dateString) {
        //     return ''; // Return an empty string if dateString is undefined or empty
        // }
    
        // Split the date string into year, month, and day components
        let [year, month, day] = dateString.split("-");
    
        // Format the date in DD/MM/YYYY format
        return `${day}/${month}/${year}`;
    }
    
    console.log("req.query",req.query)
    
    
    console.log("startDate,endDate",startDate,endDate)
    let orderQuery = {};
    if (req.query.startdate) {
        startDate = req.query.startdate;
        endDate = req.query.enddate;

        var formattedStartDate = formatDate(startDate);
        var formattedEndDate = formatDate(endDate);

        console.log("in body")
        orderQuery = { 
            orderdate: {
                $gte: formattedStartDate,
                $lte: formattedEndDate
            },
            orderstatus: { 
                $in: ["completed", "shipping"] 
            }
        }
    } else {
        console.log("no body")
        orderQuery = {
            orderstatus: { $in: ['completed', 'shipping'] } // Include documents with status 'completed' or 'shipped'
        }
    }

    const orders = await Order.find(orderQuery);
    console.log("orders",orders)

    const total = orders.reduce((accumulator,order)=>{
       return accumulator+order.total
    },0);
    console.log("total",total)

    res.render('salesreport',{orders,total})
} catch (error) {
        res.send(error.msg);
}
}

const addofferproduct = async(req,res)=>{
    try {
        console.log(req.body);
        const id= req.body.id;
        const offer =parseInt(req.body.offer, 10);
        const product = await Product.findOne({_id:id});
        console.log("product",product)
        console.log("product.price:", product.price);
const price = parseInt(product.price, 10);
console.log("product price:", price);
        const offerprice = (price*offer)/100;
        const applyoffer = await Product.updateOne({_id:id},{$set:{price:offerprice,ogprice:price,isoffer:offer,offer:"productoffer"}});
        res.json({price:offerprice,msg:"OFFER APPIED"})
    } catch (error) {
        res.send(error.msg)
    }
}

const removeofferproduct = async(req,res)=>{
    try {
        console.log(req.body);
        const id= req.body.id;
        const product = await Product.findOne({_id:id});
        const price = parseInt(product.price, 10);
        const ogprice = product.ogprice
        const removeoffer = await Product.updateOne({_id:id},{$set:{price:ogprice,isoffer:0,offer:''}});
        res.json({price:ogprice,msg:"OFFER REMOVED"})
    } catch (error) {
        res.send(error.msg)
    }
}

const addoffercategory = async(req,res)=>{
    try {
        console.log(req.body);
        const id= req.body.id;
        const offer =parseInt(req.body.offer, 10);
        const products = await Product.find({ category: id });
        console.log("products", products);
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            console.log("product", product);
            console.log("product.price:", product.price);

            const price = parseInt(product.price, 10);
            console.log("product price:", price);

            const offerprice = (price * offer) / 100;

            if (!product.offer || product.offer!=="productoffer") {
                // Update the current product only if isoffer is 0 or does not exist
                await Product.updateOne(
                    { _id: product._id },
                    { $set: { price: offerprice, ogprice: price, isoffer: offer,offer:"categoryoffer" } }
                );
            }
            

        }
        await Category.updateOne({_id:id},{$set:{ isoffer: offer}})
        res.json({msg:"OFFER APPIED"})



    } catch (error) {
        res.send(error.msg)
    }
}

const removeoffercategory = async(req,res)=>{
    try {
        console.log(req.body);
    const id= req.body.id;
    const products = await Product.find({ category: id });

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (product.offer && product.offer==="categoryoffer" ) {
        await Product.updateOne({_id:product._id},{$set:{price:product.ogprice,isoffer:0,offer:''}});
        }
    }
    await Category.updateOne({_id:id},{$set:{ isoffer: 0}});

    res.json({msg:"OFFER REMOVED"})

    } catch (error) {
        res.send(error.msg)
    }
    
}

const companygetcategory = async (req, res) => {
    try {
      const companyId = req.query.companyId;
  console.log("from fetch........",companyId)
      // Fetch the company document based on the companyId
      const company = await Company.findById(companyId);
  
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      // Get the category IDs associated with the company
      const categoryIds = company.category;
  
      // Fetch categories based on the category IDs
      const categories = await Category.find({ _id: { $in: categoryIds } });
  console.log(categories.length)
      // Send the categories as a response
      res.json(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  const loadreturnrequest = async(req,res)=>{
    try {
        const orderData = await Order.find({orderstatus:'return requested'}).sort({_id:-1});
        const requestno = 0;
        // console.log("order data",orderData);
        res.render('order',{orderData,requestno})
    } catch (error) {
        res.send(error.msg)
    }
  }
  const acceptreturnrequest= async(req,res)=>{
    try {
        console.log(req.body);
        const id = req.body.orderid;
        const newstatus =  req.body.returnrequest;

        if(req.body.returnrequest==='Returned'){
        const order = await Order.findOne({_id:id});
        const amount = order.total;
        const userid = order.user;
        const  returnorder = await Order.updateOne({_id: id},{$set:{orderstatus:newstatus}});
         walletdetails = {amount: amount, status:'credit',description:'returned order'};
        const addwallet = await User.updateOne({_id:userid},{$inc:{'wallet.balance':amount},$push:{'wallet.hystory':walletdetails}})
        }else{
            await Order.updateOne({_id: id},{$set:{orderstatus:newstatus}});
        }

        res.json({status:newstatus});
    } catch (error) {
        res.send(error.msg)
    }
  }

module.exports={
    loadlogin,varifylogin,loadhome,logout,blocked,loadaddcategory,addingcategory,unblock,loadaddcompany,addingcompany,loadcategory,loaduser,deletecategory,deletecompany,loadcompany,loadaddproduct,loadproduct,addingproduct,
    deleteproduct,loadeditproduct,editingproduct,editcompany,editcategory,editingcompany,editingcategory,draftproduct,publishproduct,deleteimage,
    loadorder,cancelorder,loadorderproducts,orderstatusupdate,deleteorderproduct,salesreport,addofferproduct,removeofferproduct,addoffercategory,
    removeoffercategory,addcompanycategory,companygetcategory,loadreturnrequest,acceptreturnrequest,
}