const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  accountActivation,
  forgotPassword,
  resetPassword,
  googleLogin
} = require("../controller/auth");
const {
  userSignupValidator,
  userSigninValidator,
  forgetPasswordValidator,
  resetPasswordValidator
} = require("../validator/auth");
const { runValidation } = require("../validator");

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/signin", userSigninValidator, runValidation, signin);
router.post("/account-activation", accountActivation);
//forgot password
router.put(
  "/forgot-password",
  forgetPasswordValidator,
  runValidation,
  forgotPassword
);
// reset password
router.put(
  "/reset-password",
  resetPasswordValidator,
  runValidation,
  resetPassword
);
router.post("/google-login", googleLogin);
module.exports = router; //{} exports empty object
