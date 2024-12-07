const { check } = require('express-validator');
uservalidator = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Enter a valid email').isEmail().normalizeEmail({
    gmail_remove_dots: true
  }),
  check('mobile', 'Invalid mobile number format').matches(/^\+91\d{10}$/),
  check('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least 1 number')
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage('Password must contain at least 1 special character')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least 1 uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least 1 lowercase letter'),
  check('comformpassword',"Passwords do not match ").custom((value,{req})=>{
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

validatePassword = [ check('comformpassword')
.isLength({ min: 6 })
.withMessage('Password must be at least 6 characters long')
.matches(/[0-9]/)
.withMessage('Password must contain at least 1 number')
.matches(/[!@#$%^&*(),.?":{}|<>]/)
.withMessage('Password must contain at least 1 special character')
.matches(/[A-Z]/)
.withMessage('Password must contain at least 1 uppercase letter')
.matches(/[a-z]/)
.withMessage('Password must contain at least 1 lowercase letter')];

module.exports={uservalidator,validatePassword}