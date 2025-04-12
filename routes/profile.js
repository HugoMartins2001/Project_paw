const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const profile = require("../controllers/profile");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "profilePic-" + uniqueSuffix + path.extname(file.originalname));
  },
});


const upload = multer({ storage: storage });


router.use(authController.verifyLoginUser);

router.get("/", (req, res) => {
  res.render("dashboard/profile", { user: req.user });
});

router.get("/editProfile", profile.editProfile);

router.post("/editProfile", upload.single("profilePic"), profile.updateProfile);


module.exports = router;
