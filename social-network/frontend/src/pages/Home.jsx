import { useEffect, useState } from "react";
import API from "../api/axios";
import { FaHeart, FaRegHeart, FaRegComment, FaRegPaperPlane, FaImage, FaTimes, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Home() {
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [activePost, setActivePost] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState([]);
  const [file, setFile] = useState(null);
  const [commentFile, setCommentFile] = useState(null);

  const PF = "http://localhost:5000/images/";
  const NO_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const isVideo = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop().toLowerCase();
    return ["mp4", "webm", "ogg", "mov"].includes(ext);
  };

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleComments = (postId) => {
    setExpandedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    setActivePost(postId);
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    let filename = null;
    if (file) {
      const data = new FormData();
      data.append("file", file);
      try {
        const res = await API.post("/upload", data);
        filename = res.data;
      } catch (err) {
        console.log(err);
        return;
      }
    }

    try {
      await API.post("/posts", { content, img: filename });
      setContent("");
      setFile(null);
      fetchPosts();
    } catch (err) {
      console.log(err);
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

  const handleComment = async (postId) => {
    if (!commentText.trim() && !commentFile) return;

    let filename = "";
    if (commentFile) {
      const data = new FormData();
      data.append("file", commentFile);
      try {
        const res = await API.post("/upload", data);
        filename = res.data;
      } catch (err) {
        console.log(err);
      }
    }

    try {
      const res = await API.post(`/posts/${postId}/comment`, {
        text: commentText || " ",
        media: filename,
      });

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, comments: res.data } : post
        )
      );

      setCommentText("");
      setCommentFile(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await API.delete(`/posts/${postId}`);
      fetchPosts();
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa", paddingBottom: 80 }}>
      {/* Header cố định */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: "white",
          borderBottom: "1px solid #dbdbdb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <h1
            style={{
            fontFamily: "'Lobster', cursive",
            fontSize: 28,
            margin: 0,
            color: "#262626",
            }}
        >
            Chatsgram
        </h1>
        </div>


      </header>

      {/* Nội dung chính */}
      <div style={{ maxWidth: 630, margin: "80px auto 0", padding: "0 16px" }}>
        {/* Card tạo bài viết */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #dbdbdb",
            borderRadius: 12,
            marginBottom: 30,
            padding: 16,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <Link to={`/profile/${currentUser?._id}`}>
              <img
                src={currentUser?.profilePicture ? PF + currentUser.profilePicture : NO_AVATAR}
                alt="avatar"
                style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }}
              />
            </Link>

            <form onSubmit={createPost} style={{ flex: 1 }}>
              <textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: 16,
                  padding: "12px 0",
                  fontFamily: "inherit",
                }}
              />

              {file && (
                <div style={{ position: "relative", margin: "12px 0" }}>
                  {isVideo(file.name) ? (
                    <video
                      src={URL.createObjectURL(file)}
                      controls
                      style={{ width: "100%", maxHeight: 500, borderRadius: 12 }}
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{ width: "100%", maxHeight: 500, objectFit: "cover", borderRadius: 12 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      border: "none",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      fontSize: 20,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: "1px solid #efefef",
                }}
              >
                <label
                  htmlFor="postFile"
                  style={{ cursor: "pointer", color: "#0095f6", padding: 8 }}
                >
                  <FaImage size={24} />
                </label>
                <input
                  id="postFile"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />

                <button
                  type="submit"
                  disabled={!content.trim() && !file}
                  style={{
                    backgroundColor: (!content.trim() && !file) ? "#b2dffc" : "#0095f6",
                    color: "white",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: (!content.trim() && !file) ? "not-allowed" : "pointer",
                  }}
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Danh sách bài viết */}
        {posts.map((post) => (
          <div
            key={post._id}
            style={{
              backgroundColor: "white",
              border: "1px solid #dbdbdb",
              borderRadius: 12,
              marginBottom: 30,
              overflow: "hidden",
            }}
          >
            {/* Header post */}
            <div style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Link to={`/profile/${post.user?._id}`} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
                <img
                  src={post.user?.profilePicture ? PF + post.user.profilePicture : NO_AVATAR}
                  alt={post.user?.username}
                  style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
                  <strong style={{ fontSize: 15 }}>{post.user?.username || "Unknown"}</strong>
                  <div style={{ fontSize: 12, color: "#8e8e8e" }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
              {/* Nút xóa chỉ hiện với chủ post */}
              {post.user?._id === currentUser?._id && (
                <button
                  onClick={() => handleDelete(post._id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ed4956",
                    cursor: "pointer",
                    fontSize: 18,
                    marginLeft: 8,
                  }}
                  title="Xóa bài viết"
                >
                  <FaTrash />
                </button>
              )}
            </div>

            {/* Nội dung text */}
            {post.content && (
              <p style={{ padding: "0 16px 12px", margin: 0, lineHeight: 1.5, fontSize: 15 }}>
                {post.content}
              </p>
            )}

            {/* Media */}
            {post.img && (
              <div>
                {isVideo(post.img) ? (
                  <video controls style={{ width: "100%", maxHeight: 600 }}>
                    <source src={PF + post.img} />
                  </video>
                ) : (
                  <img
                    src={PF + post.img}
                    alt="post"
                    style={{ width: "100%", maxHeight: 600, objectFit: "cover" }}
                  />
                )}
              </div>
            )}

            {/* Action bar */}
            <div style={{ padding: "12px 16px", display: "flex", gap: 20 }}>
              <button
                onClick={() => handleLike(post._id)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}
              >
                {post.likes.includes(currentUser?._id) ? (
                  <FaHeart color="#ed4956" size={26} />
                ) : (
                  <FaRegHeart size={26} />
                )}
                <span style={{ fontSize: 14 }}>{post.likes.length}</span>
              </button>

              <button
                onClick={() => toggleComments(post._id)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}
              >
                <FaRegComment size={26} />
                <span style={{ fontSize: 14 }}>{post.comments.length}</span>
              </button>

              <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                <FaRegPaperPlane size={24} />
              </button>
            </div>

            {/* Khu vực bình luận */}
            {expandedPosts.includes(post._id) && (
              <div style={{ borderTop: "1px solid #efefef", padding: "12px 16px" }}>
                {/* Input comment */}
                <div style={{ position: "relative", marginBottom: 12 }}>
                  {commentFile && activePost === post._id && (
                    <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 8 }}>
                      {isVideo(commentFile.name) ? (
                        <video src={URL.createObjectURL(commentFile)} controls style={{ height: 80, borderRadius: 8 }} />
                      ) : (
                        <img src={URL.createObjectURL(commentFile)} alt="preview" style={{ height: 80, borderRadius: 8 }} />
                      )}
                      <button
                        onClick={() => setCommentFile(null)}
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          background: "black",
                          color: "white",
                          border: "none",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="text"
                      placeholder={`Reply to ${post.user?.username}...`}
                      value={activePost === post._id ? commentText : ""}
                      onFocus={() => setActivePost(post._id)}
                      onChange={(e) => setCommentText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        border: "1px solid #dbdbdb",
                        borderRadius: 24,
                        outline: "none",
                        fontSize: 14,
                      }}
                    />

                    <label
                      htmlFor={`comment-file-${post._id}`}
                      style={{ cursor: "pointer", color: "#666" }}
                    >
                      <FaImage size={22} />
                    </label>
                    <input
                      id={`comment-file-${post._id}`}
                      type="file"
                      accept="image/*,video/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        setActivePost(post._id);
                        setCommentFile(e.target.files[0]);
                      }}
                    />

                    {(commentText || (commentFile && activePost === post._id)) && (
                      <button
                        onClick={() => handleComment(post._id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#0095f6",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Post
                      </button>
                    )}
                  </div>
                </div>

                {/* Danh sách comment */}
                {post.comments?.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <Link to={`/profile/${c.user?._id}`}>
                      <img
                        src={c.user?.profilePicture ? PF + c.user.profilePicture : NO_AVATAR}
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                      />
                    </Link>
                    <div
                      style={{
                        backgroundColor: "#f0f0f0",
                        padding: "8px 12px",
                        borderRadius: 18,
                        maxWidth: "80%",
                      }}
                    >
                      <Link
                        to={`/profile/${c.user?._id}`}
                        style={{ fontWeight: 600, color: "#262626", textDecoration: "none" }}
                      >
                        {c.user?.username}
                      </Link>
                      <p style={{ margin: "4px 0 0", wordBreak: "break-word" }}>{c.text}</p>
                      {c.media && (
                        <div style={{ marginTop: 8 }}>
                          {isVideo(c.media) ? (
                            <video src={PF + c.media} controls style={{ maxHeight: 200, borderRadius: 8 }} />
                          ) : (
                            <img src={PF + c.media} alt="comment" style={{ maxHeight: 200, borderRadius: 8, objectFit: "cover" }} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}