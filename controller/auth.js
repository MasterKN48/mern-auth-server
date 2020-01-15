const User = require("../model/User");
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//check email before signup to
exports.signup = (req, res) => {
  //EMAIL_TO in env is admin email where sendgrid send data as admin
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
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "10m" }
    );
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "ACCOUNT activation link",
      html: `<p>Please use the following link to activate your account</p>
        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        <hr/>
        <p>Sensetive information! Expire in 10 minutes</p>
        <p>${process.env.CLIENT_URL}</p>`
    };
    sgMail
      .send(emailData)
      .then(sent => {
        console.log("SIGNUP MAIL SENT");
        return res.json({
          msg: `Email has been sent to ${email}.Follow the link on mail to verify account`
        });
      })
      .catch(err => {
        console.log("mail signup error", err);
        return res.json({
          error: err.message
        });
      });
  });
};
exports.signin = (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  User.findOne({ email }).exec((err, usr) => {
    if (err || !usr) {
      return res.status(400).json({
        error: "User with that emailnot exist.Please Signup!"
      });
    }
    //authenticate by schema method
    if (!usr.authenticate(password)) {
      return res.status(400).json({
        error: "Email-Password do not match"
      });
    }

    //generate token for client
    const token = jwt.sign({ _id: usr._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });
    const { name, email, _id, role } = usr;
    return res.json({
      token,
      user: { _id, name, role, email }
    });
  });
};

exports.accountActivation = (req, res) => {
  const { token } = req.body;
  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(
      err,
      decode
    ) {
      if (err) {
        console.log("JWT ACCOUNT VERIFY ERROR", err);
        return res.status(401).json({
          error: "Expires link. Signup again"
        });
      }
      const { name, email, password } = jwt.decode(token);
      const user = new User({ name, email, password });
      user.save((err, usr) => {
        if (err) {
          return res.status(401).json({
            error: "User Already activated!"
          });
        }
        return res.json({
          msg: "Signup Success. Signin now"
        });
      });
    });
  } else {
    return res.json({
      error: "Something went wrong"
    });
  }
};

exports.requireSignin = expressJWT({
  secret: process.env.JWT_SECRET // validate user by token as middleware and give req.user available
});
// auth for admin +requireSignin=req.user
exports.adminMiddleware = (req, res, next) => {
  User.findById({ _id: req.user._id }).exec((err, usr) => {
    if (err || !usr) {
      return res.status(401).json({
        error: "User not found!"
      });
    }
    if (usr.role != "admin") {
      return res.status(400).json({
        error: "Admin resource. Access denied."
      });
    }
    req.profile = usr; //make avilable
    next();
  });
};
