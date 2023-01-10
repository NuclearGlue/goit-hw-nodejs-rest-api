const express = require('express');
const ctrlAuth = require('../../controllers/controllerAuth.js');
const authenticate = require('../../midlleware/authenticate.js');

const router = express.Router();

router.post('/register', ctrlAuth.registerNewUser);

router.post('/login', ctrlAuth.userLogIn);

router.get('/current', authenticate, ctrlAuth.getCurrent);

router.post('/logout', authenticate, ctrlAuth.logOut);
module.exports = router;
