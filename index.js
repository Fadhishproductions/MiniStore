const mongoose = require("mongoose");
const dotenv =  require('dotenv')
dotenv.config()
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error: ", err);
  });
  const express = require("express");
  const app = express();
  const session = require('express-session');
  const config = require('./config/config');
   

  app.use(session({
    secret: config.sessionsecret,
    resave: false,
    saveUninitialized: true
}));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies
app.use(express.json());

  app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

const user = require('./routers/user-router');
const admin = require('./routers/admin-router');
//login route
app.use('/', user);
//admin route
app.use('/admin', admin);



app.listen(3001,()=>{console.log(process.env.TWILIOSID)
    console.log(`server is running at http://localhost:3001/`);
})
