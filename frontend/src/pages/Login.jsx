import { ArrowLeft, User, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../lib/auth.jsx";
import { api } from "../lib/api.js";
import DarkToggle from "../components/DarkToggle.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

export default function Login() {
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "", role: "corps_member", remember: false });
  const [fields, setFields] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const nextFields = {};
    if (!form.email.trim()) nextFields.email = "Username or email is required.";
    if (!form.password) nextFields.password = "Password is required.";
    setFields(nextFields);
    if (Object.keys(nextFields).length) return;

    setSubmitting(true);
    setError("");
    try {
      const loggedUser = await login(form);
      if (loggedUser && loggedUser.role === "trainer") {
        if (!loggedUser.isAuthorized || !loggedUser.isActive) {
          navigate("/inactive-account", { replace: true });
          return;
        }
      }
      if (location.state?.pendingProgramId) {
        try {
          await api("/applications/create/", {
            method: "POST",
            body: {
              programId: location.state.pendingProgramId,
              motivation: "I want to gain practical skills through SAED.",
            },
          });
        } catch (err) {
          if (!err.message?.includes("already applied")) throw err;
        }
      }
      const dest = location.state?.redirectTo || (loggedUser.role === "dunis_admin" ? "/app/dunis-admin" : "/app");
      navigate(dest, { replace: true });
    } catch (err) {
      setFields(err.data?.fields || {});
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFrame>
      <Link className="back-link" to="/"><ArrowLeft size={16} /> Back</Link>
      <h1>Welcome Back</h1>
      <p>Login to access your account</p>

      <div className="role-selector">
        <button type="button" className={`role-card ${form.role === "corps_member" ? "selected" : ""}`} onClick={() => setForm({ ...form, role: "corps_member" })}>
          <User size={24} />
          <span>I'm a Corps Member</span>
        </button>
        <button type="button" className={`role-card ${form.role === "trainer" ? "selected" : ""}`} onClick={() => setForm({ ...form, role: "trainer" })}>
          <GraduationCap size={24} />
          <span>I'm a Trainer</span>
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Username or Email *
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your username or email" required />
        </label>
        {fields.email && <span className="field-error">{fields.email}</span>}
        <label>Password *
          <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your Password" required />
        </label>
        {fields.password && <span className="field-error">{fields.password}</span>}
        <div className="form-row">
          <label className="checkbox-label"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Remember me</label>
          <Link to="/forgot">Forget Password?</Link>
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="wide-button" disabled={submitting}>{submitting ? "Logging in..." : "Login →"}</button>
      </form>
      <p className="auth-switch">Don't have an account? <Link to="/signup">Sign Up</Link></p>
    </AuthFrame>
  );
}

export function AuthFrame({ children }) {
  return (
    <main className="auth-page full-width">
      <div className="auth-top">
        <DarkToggle />
      </div>
      <div className="auth-panel">{children}</div>
    </main>
  );
}
