import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../lib/auth.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { AuthFrame } from "./Login.jsx";

export default function Signup() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nyscStateCode: "",
    stateOfDeployment: "",
    password: "",
  });
  const { signup } = useAuth();
  const navigate = useNavigate();

  function update(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (step === 1) {
      const nextFields = {};
      if (form.fullName.trim().split(/\s+/).length < 2) nextFields.fullName = "Enter first and last name.";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) nextFields.email = "Enter a valid email address.";
      if (!form.phone.trim()) nextFields.phone = "Phone number is required.";
      setFields(nextFields);
      if (Object.keys(nextFields).length) return;
      setStep(2);
      return;
    }
    const nextFields = {};
    if (!form.nyscStateCode.trim()) nextFields.nyscStateCode = "NYSC state code is required.";
    if (!form.stateOfDeployment.trim()) nextFields.stateOfDeployment = "State of deployment is required.";
    if (form.password.length < 8) nextFields.password = "Use at least 8 characters.";
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
        <span className={step === 2 ? "filled" : ""} />
      </div>
      <h1>{step === 1 ? "Create Your Account" : "Personal Details"}</h1>
      <p>{step === 1 ? "Join NYSC SAED as a Corps Member" : "Tell us a bit more about yourself"}</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        {step === 1 ? (
          <>
            <label>Full Name<input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Enter your full name" required /></label>
            {fields.fullName && <span className="field-error">{fields.fullName}</span>}
            <label>Email Address<input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Enter your email address" type="email" required /></label>
            {fields.email && <span className="field-error">{fields.email}</span>}
            <label>Phone Number<input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Enter your phone number" required /></label>
            {fields.phone && <span className="field-error">{fields.phone}</span>}
            <button className="wide-button">Continue</button>
          </>
        ) : (
          <>
            <label>NYSC State Code<input value={form.nyscStateCode} onChange={(e) => update("nyscStateCode", e.target.value)} placeholder="e.g. LA/23A/1234" required /></label>
            {fields.nyscStateCode && <span className="field-error">{fields.nyscStateCode}</span>}
            <label>State of Deployment<input value={form.stateOfDeployment} onChange={(e) => update("stateOfDeployment", e.target.value)} placeholder="e.g. Lagos" required /></label>
            {fields.stateOfDeployment && <span className="field-error">{fields.stateOfDeployment}</span>}
            <label>Password<PasswordInput value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Create a password" required minLength={8} /></label>
            {fields.password && <span className="field-error">{fields.password}</span>}
            {error && <div className="form-error">{error}</div>}
            <button className="wide-button" disabled={submitting}>{submitting ? "Creating..." : "Create Account"}</button>
          </>
        )}
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      <p className="auth-switch trainer-switch">Want to teach? <Link to="/trainer-signup">Sign up as a Trainer</Link></p>
    </AuthFrame>
  );
}
