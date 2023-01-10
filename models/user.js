const mongoose = require('mongoose');

const Joi = require('joi');
const Schema = mongoose.Schema;

const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name required'],
    },
    email: {
      type: String,
      required: [true, 'Email required'],
      unique: true,
      match: emailRegex,
    },
    password: {
      type: String,
      required: [true, 'Password required'],
    },
    token: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true },
);

const registerValidate = Joi.object({
  name: Joi.string().min(2).max(40).required(),
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
});

const logInValidate = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
});

const User = mongoose.model('user', userSchema);

userSchema.methods.setPassword = function (password) {
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(6));
};

userSchema.methods.validPassword = function (password) {
  return bCrypt.compareSync(password, this.password);
};

module.exports = {
  logInValidate,
  registerValidate,
  User,
};
