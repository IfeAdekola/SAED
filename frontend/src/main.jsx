import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell.jsx";
import BackHome from "./components/BackHome.jsx";
import { AuthProvider, useAuth } from "./lib/auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Applications from "./pages/Applications.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ManageApplications from "./pages/ManageApplications.jsx";
import ManageUsers from "./pages/ManageUsers.jsx";
import ProgramEditor from "./pages/ProgramEditor.jsx";
import Programs from "./pages/Programs.jsx";
import ProgramDetail from "./pages/ProgramDetail.jsx";
import Activities from "./pages/Activities.jsx";
import ActivityDetail from "./pages/ActivityDetail.jsx";
import Opportunities from "./pages/Opportunities.jsx";
import Forgot from "./pages/Forgot.jsx";
import Signup from "./pages/Signup.jsx";
import TrainerSignup from "./pages/TrainerSignup.jsx";
import "./styles.css";

// apply saved or system preference theme immediately so hard refresh preserves choice
try {
  const saved = localStorage.getItem("saed_dark");
  if (saved !== null) {
    document.documentElement.classList.toggle("dark", saved === "true");
  } else if (window.matchMedia) {
    document.documentElement.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
} catch (err) {
  // ignore
}

function homePathForRole() {
  return "/app";
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="screen-loader">Loading SAED IMS...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }
  return children;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <BackHome />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/activities/:id" element={<ActivityDetail />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/trainer-signup" element={<TrainerSignup />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:id" element={<ProgramDetail />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="programs" element={<Programs />} />
            <Route path="programs/:id" element={<ProgramDetail />} />
            <Route
              path="applications"
              element={
                <ProtectedRoute roles={["corps_member"]}>
                  <Applications />
                </ProtectedRoute>
              }
            />
            <Route
              path="manage-applications"
              element={
                <ProtectedRoute roles={["admin", "trainer"]}>
                  <ManageApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="program-editor"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <ProgramEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
