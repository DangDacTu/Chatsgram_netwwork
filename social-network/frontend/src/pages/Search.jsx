import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

export default function Search() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await API.get(`/user/search/${query}`);
        setUsers(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, [query]);

  return (
    <div style={{ padding: 20 }}>
      <input
        placeholder="Tìm kiếm bạn bè..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "80%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #ccc",
          marginBottom: 20,
        }}
      />

      {users.map((user) => (
        <Link
          key={user._id}
          to={`/profile/${user._id}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 10,
            textDecoration: "none",
            color: "black",
          }}
        >
          <img
            src={
              user.profilePicture
                ? "http://localhost:5000/images/" + user.profilePicture
                : "/avatar.png"
            }
            alt=""
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
          <b>{user.username}</b>
        </Link>
      ))}
    </div>
  );
}
