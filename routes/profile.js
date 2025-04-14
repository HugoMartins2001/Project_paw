const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const profile = require("../controllers/profile");
const upload = require('../middlewares/upload');

router.use(authController.verifyLoginUser);

router.get("/", (req, res) => {
  res.render("dashboard/profile", { user: req.user });
});

router.get("/editProfile", profile.editProfile);

router.post("/editProfile", upload.single("profilePic"), profile.updateProfile);


module.exports = router;
