var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  email: String,
  passwordDigest: String
});
// signup
userSchema.statics.createSecure = function (email, password, cb) {
  var that = this; // save context in this var
  // saves the user email and hashes the password
  bcrypt.genSalt(function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      console.log(hash);
      that.create({
        email: email,
        passwordDigest: hash
       }, cb)
    });
  })
};

userSchema.statics.encryptPassword = function (password) {
   var hash = bcrypt.hashSync(password, salt);
   return hash;
 };

// signin
userSchema.statics.authenticate = function(email, password, cb) {
  // find just one user w/ email
  this.findOne({
     email: email // find user by email
    }, // then if user exists with that email
    function(err, user){
      if (user === null){
        throw new Error("Username does not exist");
      } else if (user.checkPassword(password)){ // verify password
        cb(null, user); // send back that user
      }

    })
 }
userSchema.methods.checkPassword = function(password) {
        return bcrypt.compareSync(password, this.passwordDigest);
};


var User = mongoose.model("User", userSchema);

module.exports = User;
