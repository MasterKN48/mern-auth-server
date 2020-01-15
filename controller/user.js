const User = require("../model/User");
const express = require("express");
const router = express.Router();

exports.read = (req, res) => {
  const userId = req.params.id; // /user/:id
  User.findById(userId).exec((err, usr) => {
    if (err || !usr) {
      return res.status(400).json({
        error: "user not found"
      });
    }
    usr.salt = undefined;
    usr.hashed_password = undefined;
    res.json(usr);
  });
};
