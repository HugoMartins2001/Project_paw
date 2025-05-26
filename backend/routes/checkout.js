const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkout");


router.post("/createCheckoutSession", checkoutController.createCheckoutSession);

router.get("/success", checkoutController.success);

router.get("/cancel", checkoutController.cancel);

module.exports = router;
