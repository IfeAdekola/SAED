import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../lib/auth.jsx";
import { api } from "../lib/api.js";
import PasswordInput from "../components/PasswordInput.jsx";
import { AuthFrame } from "./Login.jsx";

export default function TrainerSignup() {
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const auth = useAuth();
  const navigate = useNavigate();

  function update(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextFields = {};
    if (form.fullName.trim().split(/\s+/).length < 2) nextFields.fullName = "Enter first and last name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextFields.email = "Enter a valid email address.";
    if (!form.phone.trim()) nextFields.phone = "Phone number is required.";
    if (form.password.length < 8) nextFields.password = "Use at least 8 characters.";
    setFields(nextFields);
    if (Object.keys(nextFields).length) return;

    setSubmitting(true);
    setError("");
    try {
      const data = await api("/auth/trainer-signup/", { method: "POST", body: form });
      auth.setUser(data.user);
      navigate("/app");
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
      <h1>Create Your Account</h1>
      <p>Join NYSC SAED as a Trainer</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Full Name<input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Enter your full name" required /></label>
        {fields.fullName && <span className="field-error">{fields.fullName}</span>}
        <label>Email Address<input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Enter your email address" type="email" required /></label>
        {fields.email && <span className="field-error">{fields.email}</span>}
        <label>Phone Number<input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Enter your phone number" required /></label>
        {fields.phone && <span className="field-error">{fields.phone}</span>}
        <label>Password<PasswordInput value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Create a password" required minLength={8} /></label>
        {fields.password && <span className="field-error">{fields.password}</span>}
        {error && <div className="form-error">{error}</div>}
        <button className="wide-button" disabled={submitting}>{submitting ? "Creating..." : "Create Account"}</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
    </AuthFrame>
  );
}
