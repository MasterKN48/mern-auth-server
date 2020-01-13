const { validationResult } = require("express-validator");

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      //422 unable to process further
      error: errors.array()[0].msg
    });
  }
  next();
};
