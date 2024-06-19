const mongoose = require('mongoose');

const dbConnection = () => {
    mongoose
      .connect(process.env.MONGO_URI, {
        dbName: "DealsDray",
      })
      .then(() => {
        console.log("Connected to Database");
      })
      .catch((err) => {
        console.log(`Error connecting to Database ${err}`);
      });
  };

  module.exports = dbConnection;