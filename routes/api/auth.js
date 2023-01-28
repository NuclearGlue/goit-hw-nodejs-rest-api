const express = require('express');
const ctrlAuth = require('../../controllers/controllerAuth.js');
const authenticate = require('../../midlleware/authenticate.js');
const upload = require('../../midlleware/upload.js');

const router = express.Router();

router.post('/register', ctrlAuth.registerNewUser);

router.post('/login', ctrlAuth.userLogIn);

router.get('/current', authenticate, ctrlAuth.getCurrent);

router.post('/logout', authenticate, ctrlAuth.logOut);

router.get('/verify/:verificationToken', ctrlAuth.emailVerify);

router.get('/verify', ctrlAuth.repeatVerify);

router.patch(
  '/avatars',
  authenticate,
  upload.single('avatar'),
  ctrlAuth.updateAvatar,
);
module.exports = router;
