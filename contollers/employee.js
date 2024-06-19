const Employee = require("../models/employee");
const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../midlewares/isAuthenticated");
const { response } = require("express");
const registerCtrl = asyncHandler(async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      message: "Please upload the file",
    });
  }

  const { image } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
  if (!allowedFormats.includes(image.mimetype)) {
    return res.status(400).json({
      message:
        "Please upload the file with the specified formats: PNG, JPEG, WEBP, JPG",
    });
  }

  const {
    fullName,
    password,
    email,
    mobileNumber,
    designation,
    gender,
    courses,
    role,
  } = req.body;

  if (
    !fullName ||
    !password ||
    !email ||
    !mobileNumber ||
    !designation ||
    !gender ||
    !courses || // Changed from 'course' to 'courses'
    !role // Added 'role'
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const userFound = await Employee.findOne({ fullName });
  if (userFound) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const cloudinaryResponse = await cloudinary.uploader.upload(
    image.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error : ",
      cloudinaryResponse.error || "unknown cloudinary error"
    );
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }

  const newEmployee = new Employee({
    fullName,
    password: hashedPassword,
    email,
    role,
    mobileNumber,
    designation,
    gender,
    courses,
    image: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  await newEmployee.save();
  res.redirect("/api/v1/employees/login");
  return res.status(200).json({
    success: true,
    message: "User registered successfully",
  });
});

const loginCtrl = asyncHandler(async (req, res) => {
  const { fullName, password } = req.body;
  console.log(req.body);
  // Check if fullName and password are provided
  if (!fullName || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Find user by fullName
    const userFound = await Employee.findOne({ fullName });
    console.log(userFound.role);
    // If no user is found
    if (!userFound) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare passwords
    const isPasswordMatched = await bcrypt.compare(
      password,
      userFound.password
    );

    // If passwords don't match
    if (!isPasswordMatched) {
      return res.status(404).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: userFound._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    if(userFound.role === "admin") {
      res.cookie("adminToken", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    res.redirect("/");
    // Respond with success and user information
    res.status(200).json({
      success: true,
      id: userFound._id,
      message: "User logged in successfully",
      user: userFound,
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

const getAllEmployeeCtrl = asyncHandler(async (req, res) => {
  const employee = await Employee.find();
  const isLoggedIn = req.cookies.token;
  const isAdmin = req.cookies.adminToken
  console.log(res)
  res.render("EmployeeList.ejs", { employee, isLoggedIn, isAdmin });
  res.status(200).json({
    status: "success",
    employee,
  });
});

const getEmployeedetails = asyncHandler(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

const logoutCtrl = asyncHandler(async (req, res) => {
    res.clearCookie('token'),
    res.clearCookie('adminToken')
  // Send a redirect response
  res.redirect("/");
});

const employeeUpdate = asyncHandler(async (req, res) => {
  const {
    fullName,
    password,
    email,
    mobileNumber,
    designation,
    gender,
    courses,
    role,
  } = req.body;

  let updateFields = {
    fullName,
    password,
    email,
    mobileNumber,
    designation,
    gender,
    courses,
    role,
  };

  // Check if there's a file upload
  if (req.file) {
    // Assuming multer has stored the file in req.file
    updateFields.image = {
      url: `/uploads/${req.file.filename}`, // Adjust as per your file storage logic
    };
  }

  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    updateFields,
    { new: true, runValidators: true }
  );

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  await employee.save();
  res.redirect("/api/v1/employees/employee-list");
  // res.status(200).json({ message: "Employee updated successfully", employee });
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await Employee.deleteOne({ _id: id });
  res.redirect("/api/v1/employees/employee-list");
});

const searchCtrl = asyncHandler(async (req, res) => {
  const fullName = req.query.search;
  console.log(req.query.search);
  const isLoggedIn = req.cookies.token;
  const isAdmin = req.cookies.adminToken
  const employees = await Employee.find({fullName})
  console.log(employees);
  res.render("Search.ejs", { employees, isLoggedIn, isAdmin });
});

module.exports = {
  registerCtrl,
  loginCtrl,
  getAllEmployeeCtrl,
  getEmployeedetails,
  logoutCtrl,
  employeeUpdate,
  deleteEmployee,
  searchCtrl,
};
