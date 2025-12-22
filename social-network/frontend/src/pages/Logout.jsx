import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} style={{ padding: "5px 10px", background: "#f44336", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
      Logout
    </button>
  );
}