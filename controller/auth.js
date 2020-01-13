const User = require("../model/User");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// exports.signup = (req, res) => {
//   const { name, email, password } = req.body;
//   User.findOne({ email }).exec((err, usr) => {
//     if (usr) {
//       return res.status(400).json({
//         error: "Email is taken"
//       });
//     }
//     if (err) {
//       return res.status(500).json({
//         error: err
//       });
//     }
//   });
//   let newUser = new User({ name, email, password });
//   newUser.save((err, usr) => {
//     if (err) {
//       console.log("signup error", err);
//       return res.status(400).json({
//         error: err
//       });
//     }
//     res.json({
//       msg: "Signup success!"
//     });
//   });
// };

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
          console.log("save user error while activation");
          return res.status(401).json({
            error: "Saving User in db,signup again"
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
