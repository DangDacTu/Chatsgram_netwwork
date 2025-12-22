const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Protected route",
    user: req.user,
  });
});

module.exports = router;
