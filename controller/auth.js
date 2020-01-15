const User = require("../model/User");
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");
const _ = require("lodash");
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

exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  User.findOne({ email }).exec((err, usr) => {
    if (err || !usr) {
      return res.status(400).json({
        error: "User with email does not exist"
      });
    }
    const token = jwt.sign(
      { _id: usr._id, name: usr.name },
      process.env.JWT_RESET_PASSWORD,
      {
        expiresIn: "10m"
      }
    );
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset link",
      html: `<p>Please use the following link to reset your password</p>
              <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
              <hr/>
              <p>Sensetive information! Expire in 10 minutes</p>
              <p>${process.env.CLIENT_URL}</p>`
    };
    return user.updateOne({ resetPasswordLink: token }, (err, s) => {
      if (err) {
        return res.status(400).json({
          error: "DB error in forgot password link error"
        });
      } else {
        sgMail
          .send(emailData)
          .then(sent => {
            console.log("SIGNUP MAIL SENT");
            return res.json({
              msg: `Email has been sent to ${email}.Follow the link on mail to reset password`
            });
          })
          .catch(err => {
            console.log("mail signup error", err);
            return res.json({
              error: err.message
            });
          });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, password } = req.body;
  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(
      err,
      decoded
    ) {
      if (err) {
        return res.status(400).json({
          error: "Expired link, try again."
        });
      }
      User.findOne({ resetPasswordLink }).exec((err, usr) => {
        if (err || !usr) {
          return res.status(400).json({
            error: "Error,try later"
          });
        }
        const update = {
          password: password,
          resetPasswordLink: ""
        };
        usr = _.extend(usr, update);
        usr.save((err, result) => {
          if (err) {
            return res.status(400).json({
              error: "Error reseting user password,try later"
            });
          }
          res.json({
            msg: `Great! Now Login with new password`
          });
        });
      });
    });
  }
};
//soical login
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.REACT_APP_GCLIENT_ID);
exports.googleLogin = (req, res) => {
  const { idToken } = req.body;
  client
    .verifyIdToken({ idToken, audience: process.env.REACT_APP_GCLIENT_ID })
    .then(res => {
      const { email_verified, name, email } = res.payload;
      if (email_verified) {
        User.findOne({ email }).exec((err, usr) => {
          if (usr) {
            const token = jwt.sign({ _id: user._id }, process.JWT_SECRET, {
              expiresIn: "7d"
            });
            const { _id, name, email, role } = usr;
            return res.json({
              token,
              user: { _id, email, name, role }
            });
          } else {
            // usr not exist create new usr
            let password = email + process.env.JWT_SECRET;
            usr = new User() = { name, email, password };
            usr.save((err, data) => {
              if (err) {
                console.log("Error glogin user save");
                return res.status(400).json({
                  error: "User accoutn failed to create with google"
                });
              }
              const token = jwt.sign({ _id: data._id }, process.JWT_SECRET, {
                expiresIn: "7d"
              });
              const { _id, name, email, role } = data;
              return res.json({
                token,
                user: { _id, email, name, role }
              });
            });
          }
        });
      } else {
        // email not verified
        return res.status(400).json({
          error: "Google login failed try again"
        });
      }
    });
};
