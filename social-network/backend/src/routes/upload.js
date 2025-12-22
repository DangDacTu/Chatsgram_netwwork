const router = require("express").Router();
const multer = require("multer");

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // Lưu vào thư mục public/images
  },
  filename: (req, file, cb) => {
    // Đặt tên file = thời gian hiện tại + tên gốc (để tránh trùng)
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// API Upload: http://localhost:5000/api/upload
router.post("/", upload.single("file"), (req, res) => {
  try {
    // Trả về tên file đã lưu
    return res.status(200).json(req.file.filename);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

module.exports = router;