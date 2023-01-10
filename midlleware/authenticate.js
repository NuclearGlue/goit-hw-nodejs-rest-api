const jwt = require('jsonwebtoken');

const { User } = require('../models/user');

const { SECRET_KEY } = process.env;

authenticate = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');

  if (bearer !== 'Bearer') {
    throw new Error('Unauthorized!');
    next();
  }

  try {
    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(id);
    if (!user || !user.token || token !== user.token) {
      throw new Error('Not authorized!');
    }
    req.user = user;
    next();
  } catch {
    throw new Error('Something wrong server does not respond!');
  }
};

module.exports = authenticate;
