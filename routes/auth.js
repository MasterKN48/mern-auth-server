const express = require("express");
const router = express.Router();
const { signup, signin, accountActivation } = require("../controller/auth");
const {
  userSignupValidator,
  userSigninValidator
} = require("../validator/auth");
const { runValidation } = require("../validator");

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/signin", userSigninValidator, runValidation, signin);

router.post("/account-activation", accountActivation);

module.exports = router; //{} exports empty object
