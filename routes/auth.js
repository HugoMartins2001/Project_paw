var express = require("express");
var router = express.Router();
const authController = require("../controllers/auth");
const passport = require("passport");

router.get("/login", authController.login);

router.post("/loginSubmitted", authController.submittedLogin);

router.get("/logout", authController.logout);

router.get("/register", authController.createLogin);

router.post("/registerSubmitted", authController.createLoginSubmitted);

router.get("/loginform", (req, res) => {
  res.render("login/dashboard");
});

router.get("/registerform", (req, res) => {
  res.render("login/createUser");
});

router.get("/google",passport.authenticate("google", { scope: ["profile", "email"] })
);


router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/auth/login" }),(req, res) =>
     {res.redirect("/dashboard");}
);

module.exports = router;

