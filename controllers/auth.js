const mongoUser = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("../jwt_secret/config");
const bcrypt = require("bcryptjs");
const passport = require("passport");

let authController = {};

authController.submittedLogin = function (req, res, next) {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  mongoUser
    .findOne({ email: emailInput })
    .then(function (user) {
      bcrypt.compare(passwordInput, user.password).then(function (result) {
        if (result === true) {
          const authToken = jwt.sign({ email: user.email }, config.secret, {
            expiresIn: 86400000,
          });
          res.cookie("auth-token", authToken, { maxAge: 86400000 });
          res.redirect("/dashboard");
        } else {
          res.redirect("/auth/login");
        }
      });
    })
    .catch(function (err) {
      next(err);
    });
};

authController.login = function (req, res, next) {
  res.render("login/index");
};

authController.logout = function (req, res, next) {
  res.clearCookie("auth-token");
  res.redirect("/");
};

authController.createLogin = function (req, res, next) {
  res.render("login/createUser");
};

authController.createLoginSubmitted = function (req, res, next) {
  console.log(req.body);

  const hashedPassword = bcrypt.hashSync(req.body.password, 8);
  req.body.password = hashedPassword;

  mongoUser
    .create(req.body)
    .then(function () {
      res.redirect("/auth/login");
    })
    .catch(function (err) {
      next(err);
    });
};

authController.verifyLoginUser = function (req, res, next) {
  const authToken = req.cookies["auth-token"];
  if (authToken) {
    jwt.verify(authToken, config.secret, function (err, decoded) {
      if (err) {
        return res.redirect("/auth/login");
      }

      mongoUser
        .findOne({ email: decoded.email })
        .then(function (user) {
          if (user && user.facebookId && user.email) {
            return res.redirect("/dashboard");
          }
          req.user = user;
          next();
        })
        .catch(function (err) {
          next(err);
        });
    });
  } else {
    next();
  }
};

authController.googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

authController.googleCallback = passport.authenticate(
  "google",
  { failureRedirect: "/auth/login" },
  (req, res) => {
    res.redirect("/");
  }
);

authController.findUserByEmail = function (email) {
  return mongoUser.findOne({ email: email });
};

module.exports = authController;
