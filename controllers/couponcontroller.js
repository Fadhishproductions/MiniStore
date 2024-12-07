const Coupon = require("../models/couponmodel");

const loadcoupon = async (req, res) => {
  try {
    const coupon = await Coupon.find();
    res.render("coupon", { coupon });
  } catch (error) {
    res.send(error.msg);
  }
};

const addcoupon = async (req, res) => {
  try {
    let data = "";
    if (req.query) {
      data = req.query.data;
    }
    res.render("addcoupon", { data });
  } catch (error) {
    res.send(error.msg);
  }
};

const addingcoupon = async (req, res) => {
  try {
    console.log(req.body);
    const coupon = new Coupon({
      Couponcode: req.body.code.toUpperCase(),
      expirydate: req.body.date,
      mindiscount: req.body.minprice,
      discount: req.body.discount,
      status: req.body.status,
    });
    const newcoupon = await coupon.save();
    console.log("newcoupon", newcoupon);
    const data = "coupon added sucessfully";
    res.redirect("/admin/addcoupon?id=" + newcoupon._id + "&data="+ data);
  } catch (error) {
    res.send(error.msg);
  }
};

const validatecoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const validate = await Coupon.updateOne(
      { _id: id },
      { $set: { status: "valid" } }
    );
    console.log("validate", validate);
    res.redirect("/admin/coupon");
  } catch (error) {
    res.send(error.msg);
  }
};

const invalidatecoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const invalidate = await Coupon.updateOne(
      { _id: id },
      { $set: { status: "invalid" } }
    );
    console.log("invalidate", invalidate);
    res.redirect("/admin/coupon");
  } catch (error) {
    res.send(error.msg);
  }
};

const editcoupon = async (req, res) => {
  try {
    data = "";
    if (req.query) {
      data = req.query.data;
    }
    const id = req.query.id;
    const coupon = await Coupon.findOne({ _id: id });
    res.render("editcoupon", { data, coupon });
  } catch (error) {
    res.send(error.msg);
  }
};

const editingcoupon = async (req, res) => {
  try {
    console.log(req.body);
    const id = req.body.id;
    const code = req.body.code.toUpperCase();
    const match = await Coupon.findOne({ Couponcode: code });
    console.log("match", match);
    if (match) {
     const  data = "This coupon exists";
     res.redirect("/admin/editcoupon?id=" + id + "&data="+ data);
    } else {
      const update = await Coupon.updateOne(
        { _id: id },
        {
          $set: {
            Couponcode: code,
            expirydate: req.body.date,
            mindiscount: req.body.minprice,
            discount: req.body.discount,
            status: req.body.status,
          },
        }
      );
      console.log("updated",update);
     const data = "coupon is updated";
      res.redirect("/admin/editcoupon?id=" + id + "&data="+ data);
    }
  } catch (error) {
    res.send(error.msg);
  }
};

const applycoupon = async (req, res) => {
  try {
    const code = req.query.code;
    const total = req.query.total;
    console.log("hiii",code,total)
    const coupon = await Coupon.findOne({ Couponcode:code , status :"valid" });
    if (!coupon) {
     res.json({status:false,err:"Enter valid coupon !"})
  } else {
    if (coupon.expirydate < new Date())
    {
      console.log("expired coupon")
      res.json({status:false,err:"This coupon is expired !"});
    }
    else{
      console.log(coupon.expirydate < new Date(),new Date())
      console.log("applying coupon");
      const discount = Math.round((coupon.discount * total)/100);
     
      console.log("discount",discount)
      res.json({status:true,discount:discount,err:"Coupon applied !"})
    }
  }
    console.log("fetched coupon",coupon);
  } catch (error) {
    res.send(error.msg);
  }
}

module.exports = {
  loadcoupon,
  addcoupon,
  addingcoupon,
  validatecoupon,
  invalidatecoupon,
  editcoupon,
  editingcoupon,
  applycoupon,
};
