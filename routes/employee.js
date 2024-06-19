const express = require("express");
const {
  registerCtrl,
  loginCtrl,
  getAllEmployeeCtrl,
  logoutCtrl,
  getEmployeedetails,
  employeeUpdate,
  deleteEmployee,
  searchCtrl,
} = require("../contollers/employee");
const isAuthenticated = require("../midlewares/isAuthenticated");
const Employee = require("../models/employee");
const employee = express.Router();

employee.post("/register", registerCtrl);
employee.get("/register", async (req, res) => {
  res.render("Register.ejs");
});
employee.post("/login", loginCtrl);
employee.get("/employee-list", getAllEmployeeCtrl);
employee.get("/login", async (req, res) => {
  res.render("login.ejs");
});
employee.put("/update/:id", employeeUpdate);
employee.get("/update/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const employee = await Employee.findById(id);
  res.render("UpdateForm.ejs", { employee });
});
employee.get('/search', searchCtrl)
employee.delete("/delete/:id", deleteEmployee);
employee.get("/logout", isAuthenticated, logoutCtrl);
module.exports = employee;
