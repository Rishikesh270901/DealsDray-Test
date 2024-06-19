const express = require("express");
const dbConnection = require("./database/dbConnect");
const cloudinary = require("cloudinary");
const fileUpload = require('express-fileupload')
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override');
const employee = require('./routes/employee');
const app = express();
require("dotenv").config();
dbConnection();
//middlewares
app.use(express.json()); //passing th incoming json data.
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); //to pass form data
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLUOD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
// Configure method override middleware
app.use(methodOverride('_method'));
dbConnection();
app.use("/api/v1/employees", employee);
app.get('/', async (req, res) =>{
  const isLoggedIn = req.cookies.token;
  const isAdmin = req.cookies.adminToken;
  res.render('Home.ejs',{isLoggedIn, isAdmin});
})
app.listen(1000, () => {
  console.log("server is running on port 1000");
});
