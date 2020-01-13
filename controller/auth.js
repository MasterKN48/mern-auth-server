const User = require("../model/User");

exports.signup = (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email }).exec((err, usr) => {
    if (usr) {
      return res.status(400).json({
        error: "Email is taken"
      });
    }
    if (err) {
      return res.status(500).json({
        error: err
      });
    }
  });
  let newUser = new User({ name, email, password });
  newUser.save((err, usr) => {
    if (err) {
      console.log("signup error", err);
      return res.status(400).json({
        error: err
      });
    }
    res.json({
      msg: "Signup success!"
    });
  });
};

//check email before signup
