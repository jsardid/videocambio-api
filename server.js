const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dbConfig = require("./config/database.config.js");
const routes = require("./app/routes/movie.routes.js");

// process.env.http_proxy = "http://127.0.0.1:8888";
// process.env.https_proxy = "http://127.0.0.1:8888";
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// create express app
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// Use native promises
mongoose.Promise = global.Promise;

// Configure DataBase
mongoose.connect(dbConfig.url);

mongoose.connection.on("error", () => {
  console.log("Could not connect to the database. Exiting now...");
  process.exit();
});
mongoose.connection.once("open", () => {
  console.log("Successfully connected to the database");
});

routes(app);

// listen for requests
app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
