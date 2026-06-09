import { CheckCircle2, Clock3, FileText, GraduationCap, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/dashboard/")
      .then(setData)
      .catch((err) => {
        if (err.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setError(err.message);
      });
  }, [navigate]);

  if (error) return <div className="inline-message">{error}</div>;
  if (!data) return <div className="empty-state">Checking dashboard data...</div>;

  const statItems = [
    ["Programs", data.stats.programs, GraduationCap],
    ["Applications", data.stats.applications, FileText],
    ["Pending", data.stats.pending, Clock3],
    ["Completed", data.stats.completed, CheckCircle2],
  ];
  const canManage = ["admin", "trainer"].includes(user?.role);

  return (
    <div className="dashboard-grid">
      <section className="stat-grid">
        {statItems.map(([label, value, Icon]) => (
          <article className="stat-card" key={label}>
            <Icon size={22} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Featured Programs</h2>
          <Link to="/app/programs">View all</Link>
        </div>
        {data.featuredPrograms.length ? (
          <div className="program-list compact">
            {data.featuredPrograms.map((program) => (
            <article key={program.id} className="program-row">
              <div>
                <strong>{program.title}</strong>
                <span>{program.location} · {program.durationWeeks} weeks</span>
              </div>
              <span className="status-pill">{program.availableSlots} slots</span>
            </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No active SAED programs are available yet.</p>
          </div>
        )}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>{canManage ? "Recent Applications" : "My Applications"}</h2>
        </div>
        {data.applications.length ? (
          <div className="program-list compact">
            {data.applications.map((item) => (
              <article key={item.id} className="program-row">
                <div>
                  <strong>{item.program.title}</strong>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`status-pill status-${item.status}`}>{item.status}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>{canManage ? "No student applications have been submitted yet." : "You have not applied for a program yet."}</p>
            {!canManage && <Link className="primary-button" to="/app/programs">Choose a Program</Link>}
          </div>
        )}
      </section>
      {user?.role === "trainer" && data.trainerPrograms && (
        <section className="panel">
          <div className="panel-heading">
            <h2>My Programs</h2>
          </div>
          {data.trainerPrograms.length ? (
            <div className="program-list">
              {data.trainerPrograms.map((program) => (
                <article key={program.id} className="program-card">
                  <div>
                    <strong>{program.title}</strong>
                    <span>{program.location} · {program.durationWeeks} weeks</span>
                    <span className="status-pill">{program.availableSlots} slots available</span>
                  </div>
                  {program.applications && program.applications.length > 0 && (
                    <div className="applications-list">
                      <h4>Students Applied ({program.applications.length})</h4>
                      {program.applications.map((app) => (
                        <div key={app.id} className="application-item">
                          <span>{app.applicant.fullName}</span>
                          <span className={`status-pill status-${app.status}`}>{app.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No programs are assigned to you yet.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
