// const sgMail = require('@sendgrid/mail');

// require('dotenv').config();

// const { SENDGRID_API_KEY } = process.env;

// sgMail.setApiKey(SENDGRID_API_KEY);

// const sendEmail = async data => {
//   const email = { ...data, from: 'oleksandr.sorokin@meta.ua' };

//   await sgMail.send(email);

//   return true;
// };

const nodemailer = require('nodemailer');
require('dotenv').config();
const { META_PASSWORD } = process.env;

const nodemailerConfig = {
  host: 'smtp.meta.ua',
  port: 465, //25,465,2525
  secure: true,
  auth: {
    user: 'oleksandr.sorokin@meta.ua',
    pass: META_PASSWORD,
  },
};

const sendEmail = async data => {
  const transport = nodemailer.createTransport(nodemailerConfig);

  const email = { ...data, from: 'oleksandr.sorokin@meta.ua' };

  await transport.sendMail(email);

  return true;
};

module.exports = sendEmail;
