import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { api } from "../lib/api.js";
import { STATES, NIGERIAN_STATES } from "../data/nigerianStates.js";

const SKILL_AREAS = [
  "Agro Allied", "Automobile", "Beautification", "Construction",
  "Cosmetology", "Culture & Tourism", "Education", "Environment",
  "Film & Photography", "Food Processing", "ICT", "Power & Energy",
];

export default function FindTrainers() {
  const [lga, setLga] = useState("");
  const [skill, setSkill] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const deploymentLgas = NIGERIAN_STATES["Lagos"] || [];

  async function searchTrainers() {
    if (!lga || !skill) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ lga, skill });
      const data = await api(`/trainers/?${params}`);
      setTrainers(data.trainers || []);
    } catch (err) {
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <h1>Find & Connect with Trainers</h1>
      <p className="page-subtitle">Find trainers in your area with the skills you need</p>

      <div className="search-bar">
        <div className="search-field">
          <label>Local Government Area</label>
          <select value={lga} onChange={(e) => setLga(e.target.value)}>
            <option value="">-- Select LGA --</option>
            {deploymentLgas.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="search-field">
          <label>Skill Interest</label>
          <select value={skill} onChange={(e) => setSkill(e.target.value)}>
            <option value="">-- Select Skill --</option>
            {SKILL_AREAS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button className="wide-button" onClick={searchTrainers} disabled={!lga || !skill || loading}>
          {loading ? "Searching..." : "Search Trainers"}
        </button>
      </div>

      {searched && (
        <div className="results-info">
          <p>Found {trainers.length} trainer{trainers.length !== 1 ? "s" : ""} in {lga} with {skill} specialization</p>
        </div>
      )}

      <div className="trainers-grid">
        {trainers.map((trainer) => (
          <div key={trainer.id} className="trainer-card">
            <div className="trainer-avatar">👤</div>
            <h3>{trainer.fullName}</h3>
            <p className="trainer-specialization">{trainer.specialization}</p>
            <p className="trainer-company">{trainer.companyName}</p>
            <div className="trainer-stats">
              <span>{trainer.numberTrained}+ Trained</span>
              <span>{trainer.yearsExperience} yrs Exp.</span>
            </div>
            <p className="trainer-bio">{trainer.bio}</p>
            <Link to={`/app/connect-trainer/${trainer.id}`} className="wide-button">Connect with Trainer</Link>
          </div>
        ))}
      </div>

      {!searched && (
        <div className="empty-state">
          <p>Select your LGA and skill interest to find available trainers</p>
        </div>
      )}

      {searched && trainers.length === 0 && !loading && (
        <div className="empty-state">
          <p>No trainers found matching your criteria. Try different filters.</p>
        </div>
      )}
    </div>
  );
}
