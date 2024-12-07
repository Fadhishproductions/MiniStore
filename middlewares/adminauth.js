const islogin = async (req, res, next) => {
    try {
        if (!req.session.admin_id) {
            res.redirect('/admin');
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
        if (req.session.admin_id) {
            res.redirect('/admin/home');
        } else {
            next();
        }
    } catch (error) {
        console.error(error.stack);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    islogin,
    islogout
};
