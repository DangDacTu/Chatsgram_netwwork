import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { FaImage, FaTimes, FaPaperPlane, FaCircle } from "react-icons/fa";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [file, setFile] = useState(null);
  
  const socket = useRef();
  const scrollRef = useRef();
  
  const user = JSON.parse(localStorage.getItem("user"));
  
  const PF = "http://localhost:5000/images/";
  const NO_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

  const isVideo = (filename) => {
    if (!filename) return false;
    const ext = filename.split(".").pop().toLowerCase();
    return ["mp4", "webm", "ogg", "mov"].includes(ext);
  };

  const formatTime = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // --- SOCKET & API LOGIC (GIỮ NGUYÊN) ---
  useEffect(() => {
    socket.current = io("ws://localhost:5000");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text || "",
        media: data.media || "",
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    if (arrivalMessage && currentChat && arrivalMessage.sender === currentChat._id) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    if (user?._id) socket.current.emit("addUser", user._id);
  }, [user]);

  useEffect(() => {
    const getFriends = async () => {
      try {
        const res = await API.get("/user/" + user._id);
        setConversations(res.data.following || []);
      } catch (err) { console.log(err); }
    };
    if (user?._id) getFriends();
  }, [user?._id]);

  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat) return;
      try {
        const ids = [user._id, currentChat._id].sort();
        const convId = ids.join("_");
        const res = await API.get("/messages/" + convId);
        setMessages(res.data);
      } catch (err) { console.log(err); }
    };
    getMessages();
  }, [currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    const currentText = newMessage;
    const currentFile = file;
    
    setNewMessage("");
    setFile(null);

    const ids = [user._id, currentChat._id].sort();
    const convId = ids.join("_");
    let filename = "";

    try {
      if (currentFile) {
        const data = new FormData();
        data.append("file", currentFile);
        const res = await API.post("/upload", data);
        filename = res.data;
      }

      socket.current.emit("sendMessage", {
        senderId: user._id,
        receiverId: currentChat._id,
        text: currentText,
        media: filename,
      });

      const res = await API.post("/messages", {
        conversationId: convId,
        sender: user._id,
        text: currentText,
        media: filename,
      });

      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  // --- UPDATED STYLE OBJECTS (BỐ CỤC HÀI HÒA HƠN) ---
  const styles = {
    // Container chính: Chiếm gần hết chiều cao, căn giữa, viền mềm mại
    container: { 
        display: "flex", 
        height: "calc(100vh - 40px)", // Chiếm chiều cao màn hình trừ đi một chút margin
        width: "98%", // Chiếm gần hết chiều ngang
        maxWidth: "1600px", // Giới hạn tối đa trên màn hình cực lớn
        margin: "20px auto", // Căn giữa
        background: "#fff", 
        borderRadius: "16px", // Bo góc mềm mại hơn
        boxShadow: "0 5px 25px rgba(0,0,0,0.08)", // Shadow nhẹ nhàng
        overflow: "hidden",
        border: "1px solid #e5e5e5" // Viền mỏng bao quanh
    },
    // Sidebar: Chiều rộng cố định, không bị co giãn
    sidebar: { 
        width: "350px", // Chiều rộng chuẩn cho sidebar
        minWidth: "300px", // Đảm bảo không quá nhỏ
        flexShrink: 0, // Không bị co lại khi màn hình nhỏ
        borderRight: "1px solid #e5e5e5", 
        display: "flex", 
        flexDirection: "column",
        backgroundColor: "#fafafa" // Màu nền hơi khác một chút để phân tách
    },
    sidebarHeader: { padding: "20px 25px", borderBottom: "1px solid #e5e5e5", fontSize: "22px", fontWeight: "800", color: "#1a1a1a" },
    friendList: { overflowY: "auto", flex: "1", padding: "10px" },
    friendItem: (active) => ({ 
        display: "flex", 
        alignItems: "center", 
        padding: "12px 15px", 
        cursor: "pointer", 
        borderRadius: "10px",
        transition: "all 0.2s", 
        backgroundColor: active ? "#e6f2ff" : "transparent", // Màu active xanh nhạt
        marginBottom: "5px"
    }),
    // Chat Box: Chiếm toàn bộ không gian còn lại
    chatBox: { 
        flex: "1", // Tự động lấp đầy không gian
        display: "flex", 
        flexDirection: "column", 
        background: "#fff",
        position: "relative"
    },
    chatHeader: { padding: "15px 25px", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", background: "#fff", zIndex: 10, boxShadow: "0 2px 5px rgba(0,0,0,0.03)" },
    messagesArea: { flex: "1", padding: "25px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: "#fff" },
    inputArea: { padding: "20px 25px", borderTop: "1px solid #e5e5e5", background: "#fff" },
    messageBubble: (own) => ({
      maxWidth: "65%", // Giới hạn chiều rộng bubble để dễ đọc hơn
      padding: "12px 18px",
      borderRadius: "20px",
      background: own ? "#0084ff" : "#f0f2f5",
      color: own ? "#fff" : "#1c1e21",
      fontSize: "15px",
      lineHeight: "1.5",
      borderBottomRightRadius: own ? "4px" : "20px",
      borderBottomLeftRadius: own ? "20px" : "4px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    })
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>Chats</div>
        <div style={styles.friendList}>
          {conversations.map((friend) => (
            <div
              key={friend._id}
              onClick={() => setCurrentChat(friend)}
              style={styles.friendItem(currentChat?._id === friend._id)}
              // Thêm hiệu ứng hover thủ công
              onMouseEnter={(e) => { if(currentChat?._id !== friend._id) e.currentTarget.style.backgroundColor = "#f0f2f5" }}
              onMouseLeave={(e) => { if(currentChat?._id !== friend._id) e.currentTarget.style.backgroundColor = "transparent" }}
            >
              <div style={{ position: "relative", marginRight: "15px" }}>
                <img 
                  src={friend.profilePicture ? PF + friend.profilePicture : NO_AVATAR} 
                  alt="" 
                  style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "1px solid #e5e5e5" }} 
                />
                <FaCircle style={{ position: "absolute", bottom: "2px", right: "2px", color: "#31a24c", fontSize: "14px", border: "2px solid white", borderRadius: "50%" }} />
              </div>
              <span style={{ fontWeight: "600", fontSize: "16px", color: "#1a1a1a" }}>{friend.username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT BOX */}
      <div style={styles.chatBox}>
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <img 
                src={currentChat.profilePicture ? PF + currentChat.profilePicture : NO_AVATAR} 
                alt="" 
                style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", marginRight: "12px", border: "1px solid #e5e5e5" }} 
              />
              <div>
                <div style={{ fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>{currentChat.username}</div>
                <div style={{ fontSize: "13px", color: "#65676b", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FaCircle size={8} color="#31a24c" /> Active now
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messagesArea}>
              {messages.map((m, index) => {
                const isOwn = m.sender === user._id;
                return (
                  <div key={index} ref={index === messages.length - 1 ? scrollRef : null} style={{ display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start" }}>
                    
                    <div style={{ display: "flex", alignItems: "flex-end", maxWidth: "100%" }}>
                      {!isOwn && (
                        <img 
                          src={currentChat.profilePicture ? PF + currentChat.profilePicture : NO_AVATAR} 
                          alt="" 
                          style={{ width: "30px", height: "30px", borderRadius: "50%", marginRight: "8px", marginBottom: "5px", objectFit: "cover" }} 
                        />
                      )}

                      <div style={styles.messageBubble(isOwn)}>
                        {m.text && <div>{m.text}</div>}
                        {m.media && (
                          <div style={{ marginTop: m.text ? "8px" : "0" }}>
                            {isVideo(m.media) ? (
                              <video src={PF + m.media} controls style={{ maxWidth: "100%", borderRadius: "12px" }} />
                            ) : (
                              <img src={PF + m.media} alt="media" style={{ maxWidth: "100%", borderRadius: "12px" }} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Time */}
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "4px", marginRight: isOwn ? "5px" : "0", marginLeft: isOwn ? "42px" : "0" }}>
                      {formatTime(m.createdAt || Date.now())}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div style={styles.inputArea}>
              {file && (
                <div style={{ position: "relative", width: "fit-content", marginBottom: "10px", padding: "8px", background: "#f5f5f5", borderRadius: "12px", border: "1px solid #e5e5e5" }}>
                  {isVideo(file.name) ? (
                    <video src={URL.createObjectURL(file)} style={{ height: "100px", borderRadius: "8px" }} />
                  ) : (
                    <img src={URL.createObjectURL(file)} alt="preview" style={{ height: "100px", borderRadius: "8px", objectFit: "cover" }} />
                  )}
                  <div onClick={() => setFile(null)} style={{ position: "absolute", top: "-8px", right: "-8px", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.2)", borderRadius: "50%", padding: "4px", cursor: "pointer", display: "flex" }}>
                    <FaTimes color="#ff4d4f" size={14} />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label htmlFor="chatFile" style={{ cursor: "pointer", padding: "10px", borderRadius: "50%", transition: "0.2s", color: "#0084ff", background: "#f0f2f5" }}>
                  <FaImage size={24} />
                </label>
                <input id="chatFile" type="file" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} accept="image/*,video/*" />
                
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{ width: "100%", padding: "14px 18px", paddingRight: "50px", borderRadius: "30px", border: "1px solid #e5e5e5", outline: "none", fontSize: "15px", backgroundColor: "#f0f2f5" }}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit(e)}
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim() && !file}
                    style={{ 
                      position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                      background: "transparent", 
                      color: (!newMessage.trim() && !file) ? "#bcc0c4" : "#0084ff",
                      border: "none", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" 
                    }}
                  >
                    <FaPaperPlane size={20} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#65676b", background: "#fafafa" }}>
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>💬</div>
            <div style={{ fontSize: "20px", fontWeight: "600" }}>Select a friend to start chatting</div>
          </div>
        )}
      </div>
    </div>
  );
}