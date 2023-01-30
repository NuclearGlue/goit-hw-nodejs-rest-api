const bCrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const path = require('path');
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');

const sendEmail = require('../helpers/sendEmail');

const { User, logInValidate, registerValidate } = require('../models/user');

const { SECRET_KEY, BASE_URL } = process.env;

const registerNewUser = async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = registerValidate.validate(req.body);
  const user = await User.findOne({ email });
  try {
    if (error) {
      throw error;
    }
    if (user) {
      throw new Error('This user already exist');
    }
    const hashPassword = await bCrypt.hash(password, 10);
    const verificationToken = uuidv4();
    const avatarURL = gravatar.url(email);

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: 'Verify email',
      html: `<a target="_blank" href='${BASE_URL}/api/auth/verify/${verificationToken}'>Click here to verify</>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({ user: newUser });
  } catch (e) {
    res.status(400).json({ message: e.message });
    next(e);
  }
};

const userLogIn = async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = logInValidate.validate(req.body);
  if (error) {
    throw new Error('Some fields are missing!');
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Wrong email or password!');
  }

  if (!user.verify) {
    throw new Error('User not verified');
  }

  const passwordCompare = await bCrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw new Error('Wrong email or password');
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });

  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    email: user.email,
    name: user.name,
  });
};

const getCurrent = async (req, res, next) => {
  const { email, name } = req.user;

  res.json({
    email,
    name,
  });
};

const logOut = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: '' });
  console.log('Loged out!');
};

const updateAvatar = async (req, res, next) => {
  const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');
  const { _id } = req.user;
  const { path: tempUpload, filename } = req.file;
  const newFileName = `${_id}_${filename}`;
  const resultUpload = path.join(avatarsDir, newFileName);

  const avatarURL = path.join('avatars', filename);

  try {
    Jimp.read(tempUpload, (error, avatar) => {
      if (error) {
        res.status(401).json({
          message: 'File cannot be read',
        });
        throw error;
      }
      avatar
        .resize(250, 250) // resize
        .quality(60) // set JPEG quality
        .write(resultUpload); // save
    });
    await fs.rename(tempUpload, resultUpload);
    await User.findByIdAndUpdate(_id, { avatarURL });
    res.status(200).json({ avatarURL });
  } catch (e) {
    await fs.unlink(tempUpload);
    res.status(401).json({
      message: 'Not authorized',
    });
  }
};

const emailVerify = async (req, res, next) => {
  const { verificationToken } = req.params;
  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      res.status(400).json({ message: 'User does not exist!' });
    }
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: '',
    });
    res.status(200).json({ message: 'Verification success!' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

const repeatVerify = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      res.status(400).json({ message: 'Missing required field email' });
    }
    const user = await User.findOne({ email });

    if (!user.verificationToken) {
      res
        .status(400)
        .json({ message: 'User not registred or already verified!' });
    }
    const verificationEmail = {
      to: email,
      subject: 'Verify email',
      html: `<a target="_blank" href='${BASE_URL}/api/auth/verify/${user.verificationToken}'>Click here to verify</>`,
    };

    await sendEmail(verificationEmail);

    res.status(200).json({ message: 'Verification email sent!' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

module.exports = {
  registerNewUser,
  userLogIn,
  getCurrent,
  logOut,
  updateAvatar,
  emailVerify,
  repeatVerify,
};
