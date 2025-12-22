import "./sidebar.css";
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
  MessageCircle,
  MoreHorizontal,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (!currentUser) return null;

  const menu = [
    { icon: Home, path: "/home", label: "Home" },
    { icon: Search, path: "/search", label: "Search" },
    { icon: MessageCircle, path: "/chat", label: "Messages" },
    { icon: PlusSquare, path: "/create", label: "Create" },
    { icon: Heart, path: "/activity", label: "Notifications" },
    { icon: User, path: `/profile/${currentUser._id}`, label: "Profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login"); // ✅ React flow
  };

  return (
    <div className="sidebar">
      {/* LOGO */}
      <div className="sidebar-logo">
        <Link to="/home">
          <img src="/chatsgram.jpg" alt="Chatsgram" />
        </Link>
      </div>

      {/* MENU */}
      <div className="sidebar-menu">
        {menu.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <Link
              key={index}
              to={item.path}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              title={item.label}
            >
              <Icon size={26} />
            </Link>
          );
        })}

        {/* MORE */}
        <div
          className="sidebar-item"
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          style={{ position: "relative" }}
          title="More"
        >
          <MoreHorizontal size={26} />

          {showMoreMenu && (
            <>
              <div className="more-menu-popup">
                <div
                  className="more-menu-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                  <span>Log out</span>
                </div>
              </div>

              {/* Overlay */}
              <div
                className="more-menu-overlay"
                onClick={() => setShowMoreMenu(false)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
