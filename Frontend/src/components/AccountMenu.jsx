import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { clearAuthSession, getCurrentUser } from "../services/auth.js";
import { dashboardApi } from "../services/api.js";
import menuItems from "../data/accountMenuItems.js";
import "../styles/accountMenu.css";

const getStoredUser = () => getCurrentUser('guest');

const AccountMenu = ({ user: userProp }) => {
  const navigate = useNavigate();
  const [storedUser, setStoredUser] = useState(getStoredUser());

  useEffect(() => {
    const handleUserUpdate = () => {
      setStoredUser(getStoredUser());
    };

    window.addEventListener("storage", handleUserUpdate);
    window.addEventListener("hotel_guest_user_updated", handleUserUpdate);

    dashboardApi.getProfileImage()
      .then((avatar) => {
        const current = getStoredUser();
        const merged = { ...current, avatar };
        localStorage.setItem("hotel_guest_user", JSON.stringify(merged));
        setStoredUser(merged);
      })
      .catch(() => { });

    return () => {
      window.removeEventListener("storage", handleUserUpdate);
      window.removeEventListener("hotel_guest_user_updated", handleUserUpdate);
    };
  }, []);

  const user = userProp || storedUser;

  const handleLogout = () => {
    clearAuthSession('guest');
    navigate("/login");
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="light"
        id="account-menu-toggle"
        className="d-flex align-items-center px-3 py-2 account-menu-toggle"
        style={{ minWidth: "220px" }}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            className="rounded-circle"
            style={{ width: 36, height: 36, objectFit: "cover", marginRight: 8 }}
          />
        ) : (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-secondary text-white"
            style={{ width: 36, height: 36, marginRight: 5 }}
          >
            <FontAwesomeIcon icon={faUser} />
          </div>
        )}

        <div className="d-flex flex-column text-start lh-sm">
          <span className="fw-semibold">{user?.fullName || "Account"}</span>
          {user?.email && (
            <span className="text-muted small">{user.email}</span>
          )}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow-sm account-menu-dropdown" style={{ minWidth: "220px" }}>
        {menuItems.map((item) => (
          <Dropdown.Item
            key={item.path}
            onClick={() => navigate(item.path)}
            className="d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={item.icon} className="text-muted" />
            {item.label}
          </Dropdown.Item>
        ))}

        <Dropdown.Divider />

        <Dropdown.Item
          onClick={handleLogout}
          className="d-flex align-items-center gap-2 text-danger"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AccountMenu;
