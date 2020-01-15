const express = require("express");
const router = express.Router();
const { read } = require("../controller/user");
const { requireSignin, adminMiddleware } = require("../controller/auth");
// const {
//   userSignupValidator,
//   userSigninValidator
// } = require("../validator/auth");
//const { runValidation } = require("../validator");

router.get("/user/:id", requireSignin, read);
// admin allowed only to perform this
//router.put("/admin/update",requireSignin,adminMiddleware,update);

module.exports = router; //{} exports empty object
