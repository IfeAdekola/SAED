import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../lib/api.js";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setError("No verification token provided.");
      return;
    }
    api("/auth/email-verify/", { method: "POST", body: { token } })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(err.message);
      });
  }, [searchParams]);

  return (
    <div className="auth-page full-width">
      <div className="auth-panel">
        {status === "verifying" && <p>Verifying your email...</p>}
        {status === "success" && (
          <>
            <div className="success-icon"><CheckCircle size={48} /></div>
            <h1>Email Verified!</h1>
            <p>Your email has been verified. You can now log in and wait for admin approval.</p>
            <Link to="/login" className="wide-button">Go to Login</Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="success-icon" style={{ color: "var(--danger-fg)" }}><XCircle size={48} /></div>
            <h1>Verification Failed</h1>
            <p>{error}</p>
            <Link to="/login" className="wide-button">Go to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}
