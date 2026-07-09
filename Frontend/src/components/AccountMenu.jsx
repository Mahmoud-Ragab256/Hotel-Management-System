import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { clearAuthSession, getCurrentUser } from "../services/auth.js";
import { dashboardApi } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";
import menuItems from "../data/accountMenuItems.js";
import "../styles/accountMenu.css";

const getStoredUser = () => getCurrentUser('guest');

const AccountMenu = ({ user: userProp }) => {
  const navigate = useNavigate();
  const [storedUser, setStoredUser] = useState(getStoredUser());
  const { colors, isDark } = useTheme();

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
        className="d-flex align-items-center account-menu-toggle"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: "50%", 
              objectFit: "cover",
              border: `1px solid ${colors.borderCard || 'rgba(255,255,255,0.1)'}`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)"
            }}
          />
        ) : (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white"
            style={{ 
              width: 32, 
              height: 32, 
              background: colors.accent,
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <FontAwesomeIcon icon={faUser} />}
          </div>
        )}

        <span style={{ fontSize: "14px", fontWeight: "600", marginRight: "2px", color: colors.textPrimary }}>
          {user?.fullName?.split(" ")[0] || "Account"}
        </span>

        {/* Minimalist modern chevron pointing down */}
        <svg 
          width="10" 
          height="6" 
          viewBox="0 0 10 6" 
          fill="none" 
          stroke={colors.textSecondary} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ opacity: 0.8 }}
        >
          <path d="M1 1l4 4 4-4" />
        </svg>
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="shadow-sm account-menu-dropdown" 
        style={{ 
          minWidth: "240px",
          background: colors.bgCard,
          borderColor: colors.borderCard
        }}
      >
        {/* Profile Info Header Block */}
        <div style={{ padding: '16px 16px 12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              style={{ 
                width: 52, 
                height: 52, 
                borderRadius: "50%", 
                objectFit: "cover",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                marginBottom: '10px'
              }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white"
              style={{ 
                width: 52, 
                height: 52, 
                background: colors.accent,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: '10px'
              }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <FontAwesomeIcon icon={faUser} />}
            </div>
          )}
          <div style={{ fontWeight: '600', fontSize: '15px', color: colors.textPrimary, wordBreak: 'break-all' }}>
            {user?.fullName || "Account"}
          </div>
          {user?.email && (
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px', wordBreak: 'break-all' }}>
              {user.email}
            </div>
          )}
        </div>

        <Dropdown.Divider style={{ margin: '8px 0', borderColor: colors.borderCard }} />

        {menuItems.map((item) => (
          <Dropdown.Item
            key={item.path}
            onClick={() => navigate(item.path)}
            className="d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={item.icon} className="account-menu-item-icon" style={{ width: '16px' }} />
            {item.label}
          </Dropdown.Item>
        ))}

        <Dropdown.Divider style={{ margin: '8px 0', borderColor: colors.borderCard }} />

        <Dropdown.Item
          onClick={handleLogout}
          className="d-flex align-items-center gap-2 text-danger"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="account-menu-item-icon" style={{ width: '16px' }} />
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AccountMenu;
