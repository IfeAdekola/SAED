import { ArrowLeft, User, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../lib/auth.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { AuthFrame } from "./Login.jsx";
import { STATES, NIGERIAN_STATES, LAGOS_LGAS } from "../data/nigerianStates.js";

const SKILL_AREAS = [
  "Agro Allied", "Automobile", "Beautification", "Construction",
  "Cosmetology", "Culture & Tourism", "Education", "Environment",
  "Film & Photography", "Food Processing", "ICT", "Power & Energy",
];

export default function Signup() {
  const [role, setRole] = useState("corps_member");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    nyscStateCode: "",
    stateOfDeployment: "",
    lgaOfDeployment: "",
    skillInterest: "",
  });
  const [trainerForm, setTrainerForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    partnerLgas: [],
    yearsExperience: "",
    bio: "",
    companyName: "",
    numberTrained: "",
  });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const deploymentLgas = form.stateOfDeployment ? NIGERIAN_STATES[form.stateOfDeployment] || [] : [];

  function update(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "stateOfDeployment") {
        next.lgaOfDeployment = "";
      }
      return next;
    });
  }

  function updateTrainer(key, value) {
    setTrainerForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTrainerLga(lga) {
    setTrainerForm((prev) => {
      const lgas = prev.partnerLgas.includes(lga)
        ? prev.partnerLgas.filter((l) => l !== lga)
        : [...prev.partnerLgas, lga];
      return { ...prev, partnerLgas: lgas };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (role === "trainer") {
      const nextFields = {};
      if (trainerForm.fullName.trim().split(/\s+/).length < 2) nextFields.fullName = "Enter first and last name.";
      if (!/^\S+@\S+\.\S+$/.test(trainerForm.email)) nextFields.email = "Enter a valid email address.";
      if (!trainerForm.phone.trim()) nextFields.phone = "Phone number is required.";
      if (!trainerForm.specialization) nextFields.specialization = "Select a specialization.";
      if (trainerForm.partnerLgas.length === 0) nextFields.partnerLgas = "Select at least one LGA.";
      if (trainerForm.password.length < 8) nextFields.password = "Use at least 8 characters.";
      if (trainerForm.password !== trainerForm.confirmPassword) nextFields.confirmPassword = "Passwords do not match.";
      setFields(nextFields);
      if (Object.keys(nextFields).length) return;

      setSubmitting(true);
      setError("");
      try {
        await fetch("/api/auth/trainer-signup/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trainerForm),
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw { message: data.error, data };
          return data;
        });
        navigate("/trainer-signup-success");
      } catch (err) {
        setFields(err.data?.fields || {});
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (step === 1) {
      const nextFields = {};
      if (form.fullName.trim().split(/\s+/).length < 2) nextFields.fullName = "Enter first and last name.";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) nextFields.email = "Enter a valid email address.";
      if (!form.phone.trim()) nextFields.phone = "Phone number is required.";
      if (!/^LA\/\d{2}[A-Z]\/\d{4}$/.test(form.nyscStateCode)) nextFields.nyscStateCode = "Format: LA/26B/0123";
      if (!form.stateOfDeployment) nextFields.stateOfDeployment = "Select your state of deployment.";
      if (!form.lgaOfDeployment) nextFields.lgaOfDeployment = "Select your LGA of deployment.";
      if (form.password.length < 8) nextFields.password = "Use at least 8 characters.";
      if (form.password !== form.confirmPassword) nextFields.confirmPassword = "Passwords do not match.";
      setFields(nextFields);
      if (Object.keys(nextFields).length) return;
      setStep(2);
      return;
    }

    const nextFields = {};
    if (!form.skillInterest) nextFields.skillInterest = "Select a skill interest.";
    setFields(nextFields);
    if (Object.keys(nextFields).length) return;

    setSubmitting(true);
    setError("");
    try {
      await signup({ ...form, role: "corps_member" });
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
      <div className="step-bars">
        <span className="filled" />
        {role === "corps_member" && <span className={step === 2 ? "filled" : ""} />}
      </div>
      <h1>Create Your Account</h1>
      <p>{role === "corps_member" ? "Join thousands of corps members learning new skills" : "Register your expertise and help corps members learn new skills"}</p>

      <div className="role-selector">
        <button type="button" className={`role-card ${role === "corps_member" ? "selected" : ""}`} onClick={() => setRole("corps_member")}>
          <User size={24} />
          <span>I'm a Corps Member</span>
        </button>
        <button type="button" className={`role-card ${role === "trainer" ? "selected" : ""}`} onClick={() => setRole("trainer")}>
          <GraduationCap size={24} />
          <span>I'm a Trainer</span>
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {role === "trainer" ? (
          <>
            <div className="form-section-title">ACCOUNT INFORMATION</div>
            <div className="form-row">
              <label>Full Name *
                <input value={trainerForm.fullName} onChange={(e) => updateTrainer("fullName", e.target.value)} placeholder="Enter your full name" required />
              </label>
              <label>Specialization/Skill Area *
                <select value={trainerForm.specialization} onChange={(e) => updateTrainer("specialization", e.target.value)} required>
                  <option value="">Select your Skill Area</option>
                  {SKILL_AREAS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
            {fields.fullName && <span className="field-error">{fields.fullName}</span>}
            {fields.specialization && <span className="field-error">{fields.specialization}</span>}

            <div className="form-row">
              <label>Email Address *
                <input value={trainerForm.email} onChange={(e) => updateTrainer("email", e.target.value)} placeholder="you@example.com" type="email" required />
              </label>
              <label>Phone Number *
                <input value={trainerForm.phone} onChange={(e) => updateTrainer("phone", e.target.value)} placeholder="+234 801 234 5678" required />
              </label>
            </div>
            {fields.email && <span className="field-error">{fields.email}</span>}
            {fields.phone && <span className="field-error">{fields.phone}</span>}

            <div className="form-row">
              <label>Years of Experience
                <select value={trainerForm.yearsExperience} onChange={(e) => updateTrainer("yearsExperience", e.target.value)}>
                  <option value="">Select</option>
                  {[1,2,3,4,5,6,7,8,9,10,15,20].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
              <label>Company Name
                <input value={trainerForm.companyName} onChange={(e) => updateTrainer("companyName", e.target.value)} placeholder="Enter your company name" />
              </label>
            </div>

            <label>Local Government Area *
              <div className="lga-checkboxes">
                {LAGOS_LGAS.map((lga) => (
                  <label key={lga} className="checkbox-label">
                    <input type="checkbox" checked={trainerForm.partnerLgas.includes(lga)} onChange={() => toggleTrainerLga(lga)} />
                    {lga}
                  </label>
                ))}
              </div>
            </label>
            {fields.partnerLgas && <span className="field-error">{fields.partnerLgas}</span>}

            <label>Brief Bio/About *
              <textarea value={trainerForm.bio} onChange={(e) => updateTrainer("bio", e.target.value)} placeholder='"Tell us about yourself (20-500 characters)"' rows={3} />
            </label>

            <label>Number of Trained *
              <input value={trainerForm.numberTrained} onChange={(e) => updateTrainer("numberTrained", e.target.value)} placeholder="Enter No of Trained Student" type="number" />
            </label>

            <div className="form-section-title">SECURITY</div>
            <div className="form-row">
              <label>Password *
                <PasswordInput value={trainerForm.password} onChange={(e) => updateTrainer("password", e.target.value)} placeholder="Create a password" required minLength={8} />
              </label>
              <label>Confirm Password *
                <PasswordInput value={trainerForm.confirmPassword} onChange={(e) => updateTrainer("confirmPassword", e.target.value)} placeholder="Confirm password" required />
              </label>
            </div>
            {fields.password && <span className="field-error">{fields.password}</span>}
            {fields.confirmPassword && <span className="field-error">{fields.confirmPassword}</span>}
            <p className="password-hint">Password must be at least 8 characters, include uppercase, lowercase, numbers, and symbols</p>

            <label className="checkbox-label agree-label">
              <input type="checkbox" required /> I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
            </label>

            {error && <div className="form-error">{error}</div>}
            <button className="wide-button" disabled={submitting}>{submitting ? "Creating..." : "Create Trainer Account →"}</button>
          </>
        ) : step === 1 ? (
          <>
            <div className="form-section-title">ACCOUNT INFORMATION</div>
            <label>Full Name *
              <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Enter your full name" required />
            </label>
            {fields.fullName && <span className="field-error">{fields.fullName}</span>}

            <div className="form-row">
              <label>Email Address *
                <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" type="email" required />
              </label>
              <label>Phone Number *
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+234 801 234 5678" required />
              </label>
            </div>
            {fields.email && <span className="field-error">{fields.email}</span>}
            {fields.phone && <span className="field-error">{fields.phone}</span>}

            <label>State Code *
              <input value={form.nyscStateCode} onChange={(e) => update("nyscStateCode", e.target.value)} placeholder="LA/26B/0123" required />
            </label>
            {fields.nyscStateCode && <span className="field-error">{fields.nyscStateCode}</span>}

            <label>State of Deployment *
              <select value={form.stateOfDeployment} onChange={(e) => update("stateOfDeployment", e.target.value)} required>
                <option value="">Select your state</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            {fields.stateOfDeployment && <span className="field-error">{fields.stateOfDeployment}</span>}

            {form.stateOfDeployment && (
              <label>LGA of Deployment *
                <select value={form.lgaOfDeployment} onChange={(e) => update("lgaOfDeployment", e.target.value)} required>
                  <option value="">Select your LGA</option>
                  {deploymentLgas.map((lga) => <option key={lga} value={lga}>{lga}</option>)}
                </select>
              </label>
            )}
            {fields.lgaOfDeployment && <span className="field-error">{fields.lgaOfDeployment}</span>}

            <div className="form-section-title">SECURITY</div>
            <div className="form-row">
              <label>Password *
                <PasswordInput value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Create a password" required minLength={8} />
              </label>
              <label>Confirm Password *
                <PasswordInput value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Confirm password" required />
              </label>
            </div>
            {fields.password && <span className="field-error">{fields.password}</span>}
            {fields.confirmPassword && <span className="field-error">{fields.confirmPassword}</span>}
            <p className="password-hint">Password must be at least 8 characters, include uppercase, lowercase, numbers, and symbols</p>

            <label className="checkbox-label agree-label">
              <input type="checkbox" required /> I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
            </label>

            {error && <div className="form-error">{error}</div>}
            <button className="wide-button" disabled={submitting}>{submitting ? "Creating..." : "Continue to Next Step →"}</button>
          </>
        ) : (
          <>
            <div className="form-section-title">SELECT YOUR SKILL INTEREST</div>
            <p className="section-hint">Choose one skill area (required)</p>
            <div className="skill-grid">
              {SKILL_AREAS.map((skill) => (
                <button key={skill} type="button" className={`skill-card ${form.skillInterest === skill ? "selected" : ""}`} onClick={() => update("skillInterest", skill)}>
                  {skill}
                </button>
              ))}
            </div>
            {fields.skillInterest && <span className="field-error">{fields.skillInterest}</span>}

            <div className="form-actions-row">
              <button type="button" className="outline-button" onClick={() => setStep(1)}>← Back</button>
              <button className="wide-button" disabled={submitting}>{submitting ? "Creating..." : "View Available Trainers →"}</button>
            </div>
          </>
        )}
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Login here</Link></p>
    </AuthFrame>
  );
}
