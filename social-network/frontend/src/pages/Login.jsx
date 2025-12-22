import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      alert("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      window.location.href = "/home";
    } catch (err) {
      alert(err.response?.data || "Đăng nhập thất bại! Email hoặc mật khẩu sai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)", // Gradient tím - xanh - hồng hiện đại, đẹp mắt
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Lớp overlay mờ để card nổi bật hơn trên nền gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)", // Hiệu ứng kính mờ (glassmorphism) hiện đại
        }}
      />

      {/* Card chính - giữ nguyên style cũ nhưng thêm bóng mạnh hơn để nổi trên nền */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)", // Nền trắng hơi trong để hòa với gradient
          width: "100%",
          maxWidth: 380,
          borderRadius: 16,
          padding: "50px 40px",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          position: "relative",
          zIndex: 1,
          backdropFilter: "blur(20px)", // Thêm kính mờ cho card
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        {/* Logo */}
        <h1
          style={{
            fontFamily: "'Lobster', cursive",
            fontSize: 48,
            margin: "0 0 40px",
            color: "#262626",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Chatsgram
        </h1>

        {/* Form đăng nhập */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "14px 18px",
              fontSize: 16,
              border: "1px solid #dbdbdb",
              borderRadius: 12,
              backgroundColor: "white",
              outline: "none",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0095f6")}
            onBlur={(e) => (e.target.style.borderColor = "#dbdbdb")}
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "14px 18px",
              fontSize: 16,
              border: "1px solid #dbdbdb",
              borderRadius: 12,
              backgroundColor: "white",
              outline: "none",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0095f6")}
            onBlur={(e) => (e.target.style.borderColor = "#dbdbdb")}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 12,
              padding: "14px",
              background: "linear-gradient(90deg, #0095f6, #667eea)",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(0,149,246,0.3)",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            margin: "40px 0",
            display: "flex",
            alignItems: "center",
            color: "#8e8e8e",
            fontSize: 14,
          }}
        >
          <div style={{ flex: 1, height: 1, backgroundColor: "#dbdbdb" }} />
          <span style={{ padding: "0 20px", fontWeight: 600 }}>HOẶC</span>
          <div style={{ flex: 1, height: 1, backgroundColor: "#dbdbdb" }} />
        </div>

        {/* Link đăng ký */}
        <p style={{ margin: 0, color: "#262626", fontSize: 15 }}>
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            style={{
              color: "#0095f6",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}