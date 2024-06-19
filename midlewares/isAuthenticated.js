const asynchandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Employee = require("../models/employee");
const isAuthenticated = asynchandler(async (req, res, next) => {
  if (req.cookies.token) {
    const decode = jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
    req.user = await Employee.findById(decode?.id).select("-password");
    // console.log(req.user);
    return next();
  } 
  if (req.cookies.adminToken) {
    const decode = jwt.verify(req.cookies.adminToken, process.env.JWT_SECRET_KEY);
    req.user = await Employee.findById(decode?.id).select("-password");
    // console.log(req.user);
    return next();
  } 
  else {
    res.status(401).json({
      message: "user not authenticated",
    });
  }
});

module.exports = isAuthenticated;
