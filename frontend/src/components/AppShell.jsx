import { BookOpen, ClipboardCheck, ClipboardList, LayoutDashboard, LogOut, Menu, Settings, Users, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../lib/auth.jsx";
import DarkToggle from "./DarkToggle.jsx";
import UnauthorizedPage from "../pages/UnauthorizedPage.jsx";

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const canManage = ["admin", "trainer"].includes(user?.role);
  const isAdmin = user?.role === "admin";
  const isUnauthorizedTrainer = user?.role === "trainer" && !user?.isAuthorized;

  async function handleLogout() {
    await logout();
    setNavOpen(false);
    navigate("/");
  }

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <div className="app-layout">
      <aside className={`sidebar ${navOpen ? "open" : ""}`}>
        <div className="brand-mark">
          <img src="/nysc.png" alt="NYSC" className="brand-logo brand-logo-light" />
          <img src="/nysc-dark.png" alt="NYSC" className="brand-logo brand-logo-dark" />
          <div>
            <strong>NYSC SAED</strong>
            <span>Information Management</span>
          </div>
        </div>
        <button
          className="app-menu-toggle"
          onClick={() => setNavOpen((current) => !current)}
          type="button"
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={navOpen}
        >
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav>
          <NavLink to="/app" end onClick={closeNav}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/app/programs" onClick={closeNav}>
            <BookOpen size={18} /> {user?.role === "trainer" ? "Programs Taught" : "Programs"}
          </NavLink>
          {!canManage && (
            <NavLink to="/app/applications" onClick={closeNav}>
              <ClipboardList size={18} /> Applications
            </NavLink>
          )}
          {canManage && (
            <NavLink to="/app/manage-applications" onClick={closeNav}>
              <ClipboardCheck size={18} /> Review
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/app/program-editor" onClick={closeNav}>
              <Settings size={18} /> Programs Admin
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/app/users" onClick={closeNav}>
              <Users size={18} /> Users
            </NavLink>
          )}
        </nav>
        <button className="ghost-button logout-button" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="app-main">
        <header className="app-header">
          <div>
            <span className="eyebrow">{user?.role?.replace("_", " ")}</span>
            <h1>Welcome, {user?.fullName}</h1>
          </div>
          <div className="app-header-actions">
            <DarkToggle />
            <div className="profile-pill">{user?.stateOfDeployment || "SAED IMS"}</div>
          </div>
        </header>
        {isUnauthorizedTrainer ? <UnauthorizedPage /> : <Outlet />}
      </main>
    </div>
  );
}
