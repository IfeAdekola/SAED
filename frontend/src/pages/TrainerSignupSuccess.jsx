import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function TrainerSignupSuccess() {
  const { user } = useAuth();

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="success-icon">✓</div>
        <h1>Account Created Successfully!</h1>
        <p className="page-subtitle">Your trainer account has been registered. Awaiting admin verification to activate your account.</p>

        <div className="pending-badge">
          <span>⏳</span> Pending Admin Approval
        </div>

        {user && (
          <div className="trainer-profile-card">
            <div className="trainer-avatar">👤</div>
            <h3>{user.fullName}</h3>
            <p className="trainer-specialization">{user.specialization}</p>
            <p className="trainer-bio">{user.bio}</p>
          </div>
        )}

        <div className="success-card">
          <h3>WHAT HAPPENS NEXT</h3>
          <ul>
            <li>Check your email for a verification link. Click to confirm your email address.</li>
            <li>Log in to your trainer dashboard and start creating courses and connecting with corps members.</li>
          </ul>
        </div>

        <Link to="/login" className="wide-button">← Back to Login</Link>
      </div>
      <div className="auth-hero">
        <div className="auth-hero-content">
          <span className="auth-hero-icon">👩‍🏫</span>
          <h2>Share Your Expertise</h2>
          <p>You're making a real impact! Your training helps corps members develop valuable skills and transform their careers across Lagos State.</p>
        </div>
      </div>
    </div>
  );
}
