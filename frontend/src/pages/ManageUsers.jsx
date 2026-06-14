import { Save, UserPlus, ShieldCheck, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

const initialForm = { fullName: "", email: "", phone: "", role: "trainer", password: "" };

export default function ManageUsers() {
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.user;
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [fields, setFields] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await api("/manage/users/");
    setUsers(data.users || []);
  }

  useEffect(() => {
    load()
      .catch((err) => {
        if (err.status === 401) navigate("/login", { replace: true });
        else setMessage(err.message);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const next = {};
    if (form.fullName.trim().split(/\s+/).length < 2) next.fullName = "Enter first and last name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password && form.password.length < 8) next.password = "Use at least 8 characters.";
    setFields(next);
    return Object.keys(next).length === 0;
  }

  async function createUser(event) {
    event.preventDefault();
    setMessage("");
    if (!validate()) return;
    try {
      await api("/manage/users/", { method: "POST", body: form });
      setForm(initialForm);
      setFields({});
      await load();
      setMessage("User created.");
    } catch (err) {
      setFields(err.data?.fields || {});
      setMessage(err.message);
    }
  }

  async function updateUser(user, changes) {
    setMessage("");
    try {
      await api(`/manage/users/${user.id}/`, { method: "PATCH", body: changes });
      await load();
      setMessage("User updated.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section className="panel full-panel">
      <div className="panel-heading">
        <div>
          <h2>Trainer Management</h2>
          <p>Create trainer accounts and deactivate access.</p>
        </div>
      </div>

      {message && <div className="inline-message">{message}</div>}

      <form className="management-form" onSubmit={createUser}>
        <label>Full Name<input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} /></label>
        {fields.fullName && <span className="field-error">{fields.fullName}</span>}
        <label>Email<input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></label>
        {fields.email && <span className="field-error">{fields.email}</span>}
        <label>Phone<input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></label>
        <input type="hidden" value={form.role} />
        <label>Password<PasswordInput value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Optional temporary password" /></label>
        {fields.password && <span className="field-error">{fields.password}</span>}
        <button className="primary-button"><UserPlus size={16} /> Add User</button>
      </form>

      {loading ? <div className="empty-state">Loading users...</div> : null}
      {!loading ? (
        <div className="management-table">
          <div className="management-row table-head"><span>Name</span><span>Role</span><span>Status</span><span>Authorization</span><span>Actions</span></div>
          {users.map((user) => (
            <div className="management-row" key={user.id}>
              <div><strong>{user.fullName}</strong><span>{user.email}</span></div>
              <span>{user.role.replace("_", " ")}</span>
              <span className={`status-pill status-${user.isActive ? "approved" : "declined"}`}>{user.isActive ? "active" : "inactive"}</span>
              {user.role === "trainer" ? (
                <span className={`status-pill status-${user.isAuthorized ? "approved" : "pending"}`}>
                  {user.isAuthorized ? "authorized" : user.hasPaid ? "paid, pending" : "pending"}
                </span>
              ) : (
                <span className="status-pill status-approved">n/a</span>
              )}
              <div className="action-buttons">
                {user.role === "trainer" && (
                  <button
                    className="icon-action"
                    disabled={user.id === currentUser?.id}
                    onClick={() => updateUser(user, { isAuthorized: !user.isAuthorized })}
                    title={user.isAuthorized ? "Deauthorize this trainer" : "Authorize this trainer"}
                    type="button"
                  >
                    {user.isAuthorized ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                    <span>{user.isAuthorized ? "Deauthorize" : "Authorize"}</span>
                  </button>
                )}
                <button
                  className="icon-action"
                  disabled={user.id === currentUser?.id}
                  onClick={() => updateUser(user, { isActive: !user.isActive })}
                  title={user.id === currentUser?.id ? "You cannot deactivate your own account" : undefined}
                  type="button"
                >
                  <Save size={16} />
                  <span>{user.id === currentUser?.id ? "Current User" : user.isActive ? "Deactivate" : "Activate"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
