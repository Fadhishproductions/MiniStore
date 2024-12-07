const User = require('../models/usermodel');

const islogin = async (req, res, next) => {
    try {
        if (!req.session.user_id) {
            res.redirect('/login');
        } else {
            next();
        }
    } catch (error) {
        console.error(error.stack);
        res.status(500).send('Internal Server Error');
    }
};

const islogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/home');
        } else {
            next();
        }
    } catch (error) {
        console.error(error.stack);
        res.status(500).send('Internal Server Error');
    }
};

const is_blocked = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const user = await User.findOne({ _id: req.session.user_id });
console.log(user)
            if ( user.is_blocked === 1) {
              
                req.session.user_id = undefined
                res.redirect('/');
            } else {
                // User is blocked or not found
                next();
            }
        } else {
            next();
        }
    } catch (error) {
        // Handle the error, log it, or respond accordingly
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};




module.exports = {
    islogin,
    islogout,
    is_blocked
};
