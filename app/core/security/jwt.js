const jwt = require("jsonwebtoken");
const config = require("../config");

const generateToken = (payload) => {
  try {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpire });
  } catch (err) {
    return null;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  decodeToken,
};
