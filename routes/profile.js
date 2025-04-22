const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const profile = require("../controllers/profile");
const upload = require('../middlewares/upload');
const profileController = require("../controllers/profile");

router.use(authController.verifyLoginUser);

router.get("/", profileController.showProfile, (req, res) => {
  res.render("dashboard/profile", {
    user: req.user,
    totalRestaurants: 0,
    approvedRestaurants: 0,
    notApprovedRestaurants: 0,
  });
});

router.get("/editProfile", profile.editProfile);

router.post("/editProfile", upload.single("profilePic"), profile.updateProfile);


module.exports = router;
