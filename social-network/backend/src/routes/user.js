const router = require("express").Router();
const User = require("../models/User");
const verifyToken = require("../middlewares/authMiddleware");

// GET PROFILE
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// GET USER BY ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username");
    if (!user) return res.status(404).json("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// FOLLOW
router.put("/:id/follow", verifyToken, async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json("You cannot follow yourself");
  }
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) return res.status(404).json("User not found");

    // Dùng $addToSet để tránh trùng lặp mà không cần check if
    await userToFollow.updateOne({ $addToSet: { followers: req.user.id } });
    await currentUser.updateOne({ $addToSet: { following: req.params.id } });
    
    res.status(200).json("User has been followed");
  } catch (err) {
    res.status(500).json(err);
  }
});

// UNFOLLOW
router.put("/:id/unfollow", verifyToken, async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json("You cannot unfollow yourself");
  }
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) return res.status(404).json("User not found");

    await userToUnfollow.updateOne({ $pull: { followers: req.user.id } });
    await currentUser.updateOne({ $pull: { following: req.params.id } });

    res.status(200).json("User has been unfollowed");
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE USER 
router.put("/:id", verifyToken, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      // Chỉ cho phép update những gì gửi lên body
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      }, { new: true }); // new: true để trả về user mới nhất
      res.status(200).json(user);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});
// SEARCH USER BY NAME
router.get("/search/:key", async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.key, $options: "i" },
    }).select("_id username profilePicture");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;