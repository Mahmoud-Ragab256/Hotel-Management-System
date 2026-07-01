import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHotel, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { isAuthenticated } from "../services/auth.js";
import AccountMenu from "./AccountMenu";
import NotificationBell from "./NotificationsBell.jsx";
import navLinks from "../data/navbarItems.js";
import "../styles/header.css";



const Header = () => {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  return (
    <Navbar bg="white" expand="lg" className="border-bottom px-4 header-navbar">
      <Container fluid className="d-flex align-items-center justify-content-between">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 m-0">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-dark text-white"
            style={{ width: 36, height: 36 }}
          >
            <FontAwesomeIcon icon={faHotel} />
          </div>
          <span className="fw-semibold fs-5 text-dark">Hotel Name</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />

        <Navbar.Collapse id="main-navbar-nav" className="justify-content-between">
          <Nav className="mx-auto gap-2">
            {navLinks.map((link) => (
              <Nav.Link
                key={link.path}
                as={RouterNavLink}
                to={link.path}
                end={link.path === "/"}
                className="header-nav-link px-2 d-flex align-items-center gap-1"
              >
                {link.icon && <FontAwesomeIcon icon={link.icon} />}
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {loggedIn ? (
              <>
                <NotificationBell />
                <AccountMenu />
              </>
            ) : (
              <>
                <Button
                  variant="dark"
                  className="px-4 header-btn-dark"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </Button>
                <Button
                  variant="outline-dark"
                  className="px-4 header-btn-outline"
                  onClick={() => navigate("/signup")}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;