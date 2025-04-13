const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyJWT = require("../middlewares/verifyJWT");

function onlyAdmins(req, res, next) {
  if (req.user.role === "Admin") {
    next();
  } else {
    res.status(403).send("Acesso negado");
  }
}

router.get("/showUsers", verifyJWT, onlyAdmins, usersController.showUsers);

module.exports = router;
