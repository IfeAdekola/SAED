import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

export default function ConnectTrainer() {
  const { trainerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrainer() {
      try {
        const data = await api(`/trainers/?skill=${user.skillInterest || ""}`);
        const found = (data.trainers || []).find((t) => String(t.id) === String(trainerId));
        setTrainer(found);
      } catch (err) {
        setError("Failed to load trainer details.");
      } finally {
        setLoading(false);
      }
    }
    loadTrainer();
  }, [trainerId, user.skillInterest]);

  async function handleConnect() {
    setConnecting(true);
    setError("");
    try {
      await api("/connect/", { method: "POST", body: { trainerId: parseInt(trainerId) } });
      navigate("/app/connection-success");
    } catch (err) {
      setError(err.message || "Failed to connect with trainer.");
    } finally {
      setConnecting(false);
    }
  }

  if (loading) return <div className="page-container"><p>Loading...</p></div>;
  if (!trainer) return <div className="page-container"><p>Trainer not found.</p><Link to="/app/find-trainers">← Back to search</Link></div>;

  return (
    <div className="page-container">
      <h1>Confirm Your Trainer</h1>
      <p className="page-subtitle">Review and confirm your selection</p>

      <div className="step-indicator">
        <span className="dot" /><span className="dot" /><span className="dot" /><span className="dot active" /><span className="dot" />
      </div>

      <div className="trainer-card large">
        <div className="trainer-avatar">👤</div>
        <h3>{trainer.fullName}</h3>
        <p className="trainer-specialization">{trainer.specialization}</p>
        <p className="trainer-company">{trainer.companyName}</p>
        <div className="trainer-stats">
          <span>{trainer.numberTrained}+ Trained</span>
          <span>{trainer.yearsExperience} yrs Exp.</span>
        </div>
        <p className="trainer-bio">{trainer.bio}</p>
      </div>

      <div className="registration-details">
        <h3>Your Registration Details</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">FULL NAME</span>
            <span className="detail-value">{user.fullName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">EMAIL</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">PHONE</span>
            <span className="detail-value">{user.phone}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">STATE CODE</span>
            <span className="detail-value">{user.nyscStateCode}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">LOCATION (LGA)</span>
            <span className="detail-value">{user.lgaOfDeployment}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">SKILL INTEREST</span>
            <span className="detail-value">{user.skillInterest}</span>
          </div>
        </div>
      </div>

      <div className="notice-banner warning">
        <span>⚠️</span>
        <p>Important Notice: Once you confirm, your connection request will be sent to the trainer via email.</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions-row">
        <Link to="/app/find-trainers" className="outline-button">← Change Trainer</Link>
        <button className="wide-button" onClick={handleConnect} disabled={connecting}>
          {connecting ? "Connecting..." : "✓ Confirm & Connect →"}
        </button>
      </div>
    </div>
  );
}
