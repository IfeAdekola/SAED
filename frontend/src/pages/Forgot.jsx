import { useState } from "react";
import { Link } from "react-router-dom";
import FloatingNav from "../components/FloatingNav.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { useAuth } from "../lib/auth.jsx";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [reset, setReset] = useState(null);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [fields, setFields] = useState({});
  const { requestPasswordReset, confirmPasswordReset } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setFields({});
    setMessage("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFields({ email: "Enter a valid email address." });
      return;
    }
    try {
      const data = await requestPasswordReset({ email });
      setReset(data.uid && data.token ? { uid: data.uid, token: data.token } : null);
      setMessage(data.message);
    } catch (err) {
      setFields(err.data?.fields || {});
      setMessage(err.message);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    setFields({});
    setMessage("");
    if (password.length < 8) {
      setFields({ password: "Use at least 8 characters." });
      return;
    }
    try {
      await confirmPasswordReset({ ...reset, password });
      setReset(null);
      setPassword("");
      setMessage("Password updated. You can now log in.");
    } catch (err) {
      setFields(err.data?.fields || {});
      setMessage(err.message);
    }
  }

  return (
    <div className="site-page">
      <FloatingNav />
      <main className="auth-page">
        <section className="auth-panel">
          <h1>Reset Password</h1>
          <p>Enter your email to receive password reset instructions.</p>

          {message && <div className="inline-message">{message}</div>}

          {!reset ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                Email Address
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" type="email" required />
              </label>
              {fields.email && <span className="field-error">{fields.email}</span>}
              <button className="wide-button">Send Reset Link</button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleConfirm}>
              <label>
                New Password
                <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a new password" required minLength={8} />
              </label>
              {fields.password && <span className="field-error">{fields.password}</span>}
              {fields.token && <span className="field-error">{fields.token}</span>}
              <button className="wide-button">Update Password</button>
            </form>
          )}

          <p className="auth-switch"><Link to="/login">Back to Login</Link></p>
        </section>
      </main>
    </div>
  );
}
