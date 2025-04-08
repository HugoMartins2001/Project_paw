const jwt = require("jsonwebtoken");
const config = require("../jwt_secret/config");
const User = require("../models/user");

module.exports = async function verifyJWT(req, res, next) {
  const token = req.cookies["auth-token"];
  if (!token) return res.redirect("/auth/login");

  try {
    const decoded = jwt.verify(token, config.secret);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.redirect("/auth/login");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Error veryfing JWT:", err);
    return res.redirect("/auth/login");
  }
};
