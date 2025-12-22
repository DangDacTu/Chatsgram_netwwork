const router = require("express").Router();
const Message = require("../models/Message");
const verifyToken = require("../middlewares/authMiddleware");

// Gửi tin nhắn (Lưu vào DB)
router.post("/", verifyToken, async (req, res) => {
  const newMessage = new Message(req.body);
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Lấy tin nhắn theo conversationId (id1 + id2)
router.get("/:conversationId", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;