const express = require("express");
const router = express.Router();
const { signup } = require("../controller/auth");
const { userSignupValidator } = require("../validator/auth");
const { runValidation } = require("../validator");

router.post("/signup", userSignupValidator, runValidation, signup);

module.exports = router; //{} exports empty object
