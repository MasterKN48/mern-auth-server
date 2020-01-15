const express = require("express");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

//db connect
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => console.log("💻 Mondodb Connected"))
  .catch(err => console.error(err));

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors()); allow all origin
app.use(logger("dev"));

if ((process.env.NODE_ENV = "development")) {
  app.use(cors({ origin: "http://localhost:3000" })); //allow only localhost react
}
//import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
// use routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`I am running at ${port}`));
