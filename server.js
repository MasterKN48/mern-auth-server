const express = require("express");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const dotenv = require("dotenv");

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(logger());
dotenv.config();

//import routes
const authRoutes = require("./routes/auth");

// use routes
app.use("/api", authRoutes);

const port = process.env.port || 8000;
app.listen(port, () => console.log(`I am running at ${port}`));
