const twilio = require('twilio');
const config = require('../config/config')

function sendmail(otp,mobile){
    const accountSid = config.TWILIO_ACCOUNT_SID;
    const authToken = config.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
const messageDetails = {
    body: `${otp}`,
    to: mobile, // Replace with the recipient's phone number
    from: '+12058597226' // Your Twilio phone number
  };
  client.messages
  .create(messageDetails)
  .then(message => console.log(`Message sent with SID: ${message.sid}`))
  .catch(error => console.error(`Error sending message: ${error.message}`));
}




function otp(mobile){
 let digits ='1234567890';
 let otp ='';
 for(let i=0;i<5;i++){
    otp+=digits[Math.floor(Math.random()*10)]
 }
 console.log("otp in finction :",otp);
 sendmail(otp,mobile);
 return otp;
 
};


module.exports=otp;