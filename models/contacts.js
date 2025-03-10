const { Schema, model } = require('mongoose');
const Joi = require('joi');

const contactSchema = Schema(
  {
    name: {
      type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { versionKey: false, timestamps: true },
);

const addValidate = Joi.object({
  name: Joi.string().min(2).max(40).required(),
  email: Joi.string().required(),
  phone: Joi.number().required(),
  favorite: Joi.bool(),
});

const updateValidate = Joi.object({
  name: Joi.string().min(2).max(40),
  email: Joi.string(),
  phone: Joi.number(),
  favorite: Joi.bool(),
});

const updateStatus = Joi.object({
  favorite: Joi.bool().required(),
});

const Contact = model('contact', contactSchema);

module.exports = {
  addValidate,
  updateValidate,
  updateStatus,
  Contact,
};
