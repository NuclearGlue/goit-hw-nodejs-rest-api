const bCrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const path = require('path');
const Jimp = require('jimp');

const { User, logInValidate, registerValidate } = require('../models/user');

const { SECRET_KEY } = process.env;

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

    const avatarURL = gravatar.url(email);

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
    });

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

module.exports = {
  registerNewUser,
  userLogIn,
  getCurrent,
  logOut,
  updateAvatar,
};
