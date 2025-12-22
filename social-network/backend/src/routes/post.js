const router = require("express").Router();
const Post = require("../models/Post");
const verifyToken = require("../middlewares/authMiddleware");

// CREATE POST
router.post("/", verifyToken, async (req, res) => {
  try {
    const post = await Post.create({
      user: req.user.id,
      content: req.body.content,
      img: req.body.img,
    });
    const fullPost = await Post.findById(post._id).populate("user", "username profilePicture");
    res.status(201).json(fullPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL POSTS
router.get("/", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER'S POSTS
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LIKE / UNLIKE
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    if (post.likes.includes(req.user.id)) {
      await post.updateOne({ $pull: { likes: req.user.id } });
      res.status(200).json("The post has been disliked");
    } else {
      await post.updateOne({ $addToSet: { likes: req.user.id } });
      res.status(200).json("The post has been liked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// COMMENT (ĐÃ SỬA: Thêm lưu media)
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    const newComment = {
      user: req.user.id,
      text: req.body.text,
      media: req.body.media || "", // <--- DÒNG QUAN TRỌNG MỚI THÊM
    };

    post.comments.push(newComment);
    await post.save();

    // Populate để trả về username/avatar của người comment ngay lập tức
    const updatedPost = await Post.findById(post._id).populate("comments.user", "username profilePicture");
    res.json(updatedPost.comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE POST
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");
    // Chỉ cho phép xóa nếu là chủ post hoặc admin
    if (post.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json("You can delete only your post!");
    }
    await post.deleteOne();
    res.status(200).json("Post has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;