import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../lib/auth.jsx";
import { api } from "../lib/api.js";
import DarkToggle from "../components/DarkToggle.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

export default function Login() {
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [fields, setFields] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const nextFields = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextFields.email = "Enter a valid email address.";
    if (!form.password) nextFields.password = "Password is required.";
    setFields(nextFields);
    if (Object.keys(nextFields).length) return;

    setSubmitting(true);
    setError("");
    try {
      await login(form);
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
      navigate(location.state?.redirectTo || "/app", { replace: true });
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
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Email Address<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your Email Address" type="email" required /></label>
        {fields.email && <span className="field-error">{fields.email}</span>}
        <label>Password<PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your Password" required /></label>
        {fields.password && <span className="field-error">{fields.password}</span>}
        <div className="form-row">
          <label className="checkbox-label"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Remember me</label>
          <Link to="/forgot">Forget Password?</Link>
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="wide-button" disabled={submitting}>{submitting ? "Logging in..." : "Login"}</button>
      </form>
      <p className="auth-switch">Don't have an account? <Link to="/signup">Sign Up</Link></p>
    </AuthFrame>
  );
}

export function AuthFrame({ children }) {
  return (
    <main className="auth-page">
      <div className="auth-top">
        <DarkToggle />
      </div>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
