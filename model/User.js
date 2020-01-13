const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");

//user schema
const UserSchema = new Schema(
  {
    name: {
      type: String,
      trim: true, //remove whitescpaces at both end
      required: true,
      max: 48
    },
    email: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
      unique: true,
      max: 48
    },
    hashed_password: {
      type: String,
      required: true,
      max: 48
    },
    salt: String,
    role: {
      type: String,
      default: "user" //user or admin
    },
    reserPasswordLink: {
      data: String,
      default: ""
    }
  },
  { timestamps: true }
); //createAt filed updateAt automatically

//virtual : take plain password as temp field
UserSchema.virtual("password")
  .set(function(password) {
    //set temp var as password
    this._password = password; //temp var
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

//methods
UserSchema.methods = {
  encryptPassword: function(password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  makeSalt: function() {
    return Math.round(new Date().valueOf() * Math.random() + "");
  },
  authenticate: function(plainPassword) {
    // matching hash values
    return this.encryptPassword(plainPassword) === this.hashed_password;
  }
};
module.exports = User = mongoose.model("User", UserSchema);
