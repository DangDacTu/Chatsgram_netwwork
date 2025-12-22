const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    media: {
      type: String,
      default: "", // Lưu tên file ảnh hoặc video
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);