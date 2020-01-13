const express = require("express");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

//db connect

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors()); allow all origin
app.use(logger("dev"));

if ((process.env.NODE_ENV = "development")) {
  app.use(cors({ origin: "http://localhost:3000" }));
}
//import routes
const authRoutes = require("./routes/auth");

// use routes
app.use("/api", authRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`I am running at ${port}`));
