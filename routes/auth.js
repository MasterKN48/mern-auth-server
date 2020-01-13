const express = require("express");
const router = express.Router();
const { signup, accountActivation } = require("../controller/auth");
const { userSignupValidator } = require("../validator/auth");
const { runValidation } = require("../validator");

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/account-activation", accountActivation);

module.exports = router; //{} exports empty object
