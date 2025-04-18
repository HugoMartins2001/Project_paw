const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const adminController = require("../controllers/admin");


router.use(authController.verifyLoginUser, (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).render("errors/403", { message: "Access denied." });
  }
  next();
});


router.get("/logs", adminController.viewLogs);

router.post("/logs/deleteAll", adminController.deleteAllLogs);
router.post("/logs/:logId/delete", adminController.deleteLog);

module.exports = router;