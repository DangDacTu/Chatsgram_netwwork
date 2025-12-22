import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import Logout from "./Logout";
import {
  FaCamera,
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaImage,
  FaTimes,
} from "react-icons/fa";

export default function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  // State cho comment
  const [commentText, setCommentText] = useState("");
  const [activePost, setActivePost] = useState(null);
  const [commentFile, setCommentFile] = useState(null);

  // State quản lý mở/đóng bình luận từng post
  const [expandedPosts, setExpandedPosts] = useState([]);

  const currentUserData = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUserData ? currentUserData._id : null;

  const PF = "http://localhost:5000/images/";
  const NO_AVATAR =
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

  const isVideo = (filename) => {
    if (!filename) return false;
    const ext = filename.split(".").pop().toLowerCase();
    return ["mp4", "webm", "ogg", "mov"].includes(ext);
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await API.get(`/user/${id}`);
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [id]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await API.get(`/posts/user/${id}`);
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [id]);

  // Đổi avatar
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const data = new FormData();
    data.append("file", selectedFile);

    try {
      const uploadRes = await API.post("/upload", data);
      const filename = uploadRes.data;

      await API.put(`/user/${currentUserId}`, {
        profilePicture: filename,
      });

      fetchProfile();

      if (currentUserData) {
        const newUserStorage = { ...currentUserData, profilePicture: filename };
        localStorage.setItem("user", JSON.stringify(newUserStorage));
      }

      alert("Avatar updated!");
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    }
  };

  const handleFollow = async () => {
    try {
      const endpoint = user.followers.some((f) => f._id === currentUserId)
        ? `/user/${id}/unfollow`
        : `/user/${id}/follow`;
      await API.put(endpoint);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data || "Error");
    }
  };

  const handleLike = async (postId) => {
    try {
      await API.put(`/posts/${postId}/like`);
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const toggleComments = (postId) => {
    setExpandedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
    setActivePost(postId);
  };

  const handleComment = async (postId) => {
    if (!commentText.trim() && !commentFile) return;

    let filename = "";
    if (commentFile) {
      const data = new FormData();
      data.append("file", commentFile);
      try {
        const uploadRes = await API.post("/upload", data);
        filename = uploadRes.data;
      } catch (err) {
        console.log(err);
      }
    }

    try {
      const res = await API.post(`/posts/${postId}/comment`, {
        text: commentText || " ",
        media: filename,
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, comments: res.data } : post
        )
      );

      setCommentText("");
      setCommentFile(null);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  if (!user) return <p style={{ textAlign: "center", marginTop: 20 }}>Loading profile...</p>;

  const isFollowing = user.followers.some((f) => f._id === currentUserId);
  const avatarUrl = user.profilePicture ? PF + user.profilePicture : NO_AVATAR;

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      {/* Header Back + Logout */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={() => window.history.back()} style={{ padding: "8px 16px" }}>
          Back
        </button>
        {currentUserId === user._id && <Logout />}
      </div>

      {/* Profile Info */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={avatarUrl}
            alt="Avatar"
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #ddd",
            }}
          />
          {currentUserId === user._id && (
            <>
              <label
                htmlFor="fileInput"
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  background: "white",
                  borderRadius: "50%",
                  padding: 8,
                  cursor: "pointer",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
              >
                <FaCamera size={20} color="#555" />
              </label>
              <input
                id="fileInput"
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*"
              />
            </>
          )}
        </div>

        <h2 style={{ margin: "15px 0 5px" }}>{user.username}</h2>
        <p style={{ color: "#666", marginBottom: 15 }}>{user.email}</p>

        <div style={{ display: "flex", justifyContent: "center", gap: 30, marginBottom: 20 }}>
          <div>
            <b>{user.followers.length}</b> Followers
          </div>
          <div>
            <b>{user.following.length}</b> Following
          </div>
        </div>

        {currentUserId && currentUserId !== user._id && (
          <button
            onClick={handleFollow}
            style={{
              padding: "8px 20px",
              backgroundColor: isFollowing ? "#ccc" : "#0095f6",
              color: isFollowing ? "black" : "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <hr style={{ margin: "30px 0" }} />

      {/* Posts List - Giống hệt Home */}
      {posts.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999" }}>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            style={{ borderBottom: "1px solid #eee", padding: "15px 0", background: "white" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <Link to={`/profile/${post.user?._id}`} style={{ marginRight: 12 }}>
                <img
                  src={post.user?.profilePicture ? PF + post.user.profilePicture : NO_AVATAR}
                  alt="avatar"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #f0f0f0",
                  }}
                />
              </Link>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Link
                    to={`/profile/${post.user?._id}`}
                    style={{ textDecoration: "none", color: "black", fontWeight: "bold", fontSize: 15 }}
                  >
                    {post.user?.username || "Unknown User"}
                  </Link>
                  <span style={{ fontSize: 12, color: "#999" }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 15,
                    margin: "0 0 10px 0",
                    lineHeight: 1.5,
                    color: "#1a1a1a",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {post.content}
                </p>

                {/* Media Post */}
                {post.img && (
                  <div style={{ marginBottom: 12 }}>
                    {isVideo(post.img) ? (
                      <video
                        controls
                        style={{
                          width: "100%",
                          borderRadius: 12,
                          maxHeight: 500,
                          backgroundColor: "black",
                        }}
                      >
                        <source src={PF + post.img} />
                      </video>
                    ) : (
                      <img
                        src={PF + post.img}
                        alt="post"
                        style={{
                          width: "100%",
                          borderRadius: 12,
                          maxHeight: 500,
                          objectFit: "cover",
                          backgroundColor: "#f8f8f8",
                          border: "1px solid #efefef",
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 8 }}>
                  <div
                    onClick={() => handleLike(post._id)}
                    style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
                  >
                    {post.likes.includes(currentUserId) ? (
                      <FaHeart color="#ff0033" size={20} />
                    ) : (
                      <FaRegHeart size={20} />
                    )}
                    {post.likes.length > 0 && (
                      <span style={{ fontSize: 13, color: "#555" }}>{post.likes.length}</span>
                    )}
                  </div>

                  <div
                    onClick={() => toggleComments(post._id)}
                    style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
                  >
                    <FaRegComment size={20} />
                    {post.comments.length > 0 && (
                      <span style={{ fontSize: 13, color: "#555" }}>{post.comments.length}</span>
                    )}
                  </div>

                  <FaRegPaperPlane size={18} style={{ transform: "rotate(10deg)", cursor: "pointer" }} />
                </div>
              </div>
            </div>

            {/* Khu vực bình luận */}
            {expandedPosts.includes(post._id) && (
              <div style={{ marginTop: 15, paddingLeft: 52 }}>
                {/* Input comment */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: 15, position: "relative" }}>
                  {/* Preview ảnh/video comment */}
                  {commentFile && activePost === post._id && (
                    <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 5 }}>
                      {isVideo(commentFile.name) ? (
                        <video
                          src={URL.createObjectURL(commentFile)}
                          style={{ height: 60, borderRadius: 8, border: "1px solid #ddd" }}
                          controls
                        />
                      ) : (
                        <img
                          src={URL.createObjectURL(commentFile)}
                          alt="preview"
                          style={{ height: 60, borderRadius: 8, border: "1px solid #ddd" }}
                        />
                      )}
                      <FaTimes
                        onClick={() => setCommentFile(null)}
                        style={{
                          position: "absolute",
                          top: -5,
                          right: -5,
                          background: "black",
                          color: "white",
                          borderRadius: "50%",
                          padding: 3,
                          cursor: "pointer",
                          fontSize: 10,
                        }}
                      />
                    </div>
                  )}

                  <input
                    placeholder={`Reply to ${post.user?.username}...`}
                    value={activePost === post._id ? commentText : ""}
                    onFocus={() => setActivePost(post._id)}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "1px solid #eee",
                      borderRadius: 20,
                      outline: "none",
                      fontSize: 14,
                      background: "#f9f9f9",
                    }}
                  />

                  <label
                    htmlFor={`comment-file-profile-${post._id}`}
                    style={{ cursor: "pointer", marginLeft: 10, color: "#999" }}
                  >
                    <FaImage size={20} />
                  </label>
                  <input
                    id={`comment-file-profile-${post._id}`}
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      setActivePost(post._id);
                      setCommentFile(e.target.files[0]);
                    }}
                    accept="image/*,video/*"
                  />

                  {(commentText || (commentFile && activePost === post._id)) && (
                    <button
                      onClick={() => handleComment(post._id)}
                      style={{
                        marginLeft: 10,
                        color: "#0095f6",
                        background: "none",
                        border: "none",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      Post
                    </button>
                  )}
                </div>

                {/* Danh sách comment */}
                {post.comments?.map((c, i) => (
                  <div key={i} style={{ marginBottom: 15, display: "flex", alignItems: "flex-start" }}>
                    <Link to={`/profile/${c.user?._id}`}>
                      <img
                        src={c.user?.profilePicture ? PF + c.user.profilePicture : NO_AVATAR}
                        alt=""
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          marginRight: 10,
                          objectFit: "cover",
                        }}
                      />
                    </Link>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          background: "#f5f5f5",
                          padding: "8px 12px",
                          borderRadius: 12,
                          display: "inline-block",
                        }}
                      >
                        <Link
                          to={`/profile/${c.user?._id}`}
                          style={{
                            textDecoration: "none",
                            color: "black",
                            fontWeight: "bold",
                            fontSize: 13,
                            marginRight: 5,
                          }}
                        >
                          {c.user?.username}
                        </Link>
                        <span style={{ fontSize: 14, color: "#333" }}>{c.text}</span>
                      </div>

                      {c.media && (
                        <div style={{ marginTop: 5 }}>
                          {isVideo(c.media) ? (
                            <video
                              src={PF + c.media}
                              controls
                              style={{ height: 150, borderRadius: 8 }}
                            />
                          ) : (
                            <img
                              src={PF + c.media}
                              alt="comment media"
                              style={{ height: 150, borderRadius: 8, objectFit: "cover" }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}