import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";

import FloatingNav from "../components/FloatingNav.jsx";

import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

const categories = ["all", "technology", "business", "agriculture", "creative", "vocational"];
const categoryGroups = {
  technology: ["ict", "power_energy"],
  business: ["education"],
  agriculture: ["agro_allied", "food_processing", "environment"],
  creative: ["beautification", "cosmetology", "culture_tourism", "film_photography"],
  vocational: ["automobile", "construction"],
};

function categoryGroupFor(programCategory) {
  return Object.entries(categoryGroups).find(([, values]) => values.includes(programCategory))?.[0] || "vocational";
}

function categoryLabel(programCategory) {
  return programCategory.replace(/_/g, " ");
}

export default function Programs() {
  const navigate = useNavigate();
  const inApp = !!useMatch({ path: "/app/*" });
  const { user, loading: authLoading } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const isTrainer = user?.role === "trainer";
  const canManage = ["admin", "trainer"].includes(user?.role);
  const staffProgramView = inApp && canManage;

  async function load() {
    const programData = await api(inApp && isTrainer ? "/manage/programs/" : "/programs/");
    setPrograms(programData.programs);

    if (!user) {
      setApplications([]);
      return;
    }

    try {
      const endpoint = canManage ? "/manage/applications/" : "/applications/";
      const applicationData = await api(endpoint);
      setApplications(applicationData.applications);
    } catch (err) {
      if (err.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setApplications([]);
    }
  }

  useEffect(() => {
    load();
  }, [inApp, navigate, user, canManage, isTrainer]);

  const appliedProgramIds = new Set(applications.map((item) => item.program.id));
  const visiblePrograms = useMemo(
    () =>
      programs.filter((program) => {
        const matchesCategory = category === "all" || categoryGroupFor(program.category) === category;
        const matchesQuery = `${program.title} ${program.description} ${program.location} ${categoryLabel(program.category)}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [programs, category, query],
  );

  async function apply(programId) {
    if (authLoading) {
      setMessage("Checking your account...");
      return;
    }

    if (!user) {
      navigate("/login", {
        state: {
          pendingProgramId: programId,
          redirectTo: "/app",
          role: "corps_member",
        },
      });
      return;
    }

    setMessage("");
    try {
      await api("/applications/create/", {
        method: "POST",
        body: { programId, motivation: "I want to gain practical skills through SAED." },
      });
      await load();
      setMessage("Application submitted.");
      if (!inApp) {
        navigate("/app");
      }
    } catch (err) {
      if (err.status === 401) {
        navigate("/login", {
          state: {
            pendingProgramId: programId,
            redirectTo: "/app",
            role: "corps_member",
          },
          replace: true,
        });
        return;
      }
      setMessage(err.message);
    }
  }

  const content = (
    <section className="panel full-panel">
      <div className="panel-heading">
        <div>
          <h2>{isTrainer && inApp ? "Programs Being Taught" : "SAED Programs"}</h2>
          <p>{isTrainer && inApp ? "View the SAED programs assigned to you." : "Browse active training tracks and submit your interest."}</p>
        </div>
      </div>

      <div className="program-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search programs" />
        </div>
        <div className="category-tabs">
          {categories.map((item) => (
            <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="inline-message">{message}</div>}

      <div className="program-card-grid">
        {visiblePrograms.length ? visiblePrograms.map((program) => {
          const applied = appliedProgramIds.has(program.id);
          return (
            <article className="program-card" key={program.id}>
              <span className="category-label">{categoryLabel(program.category)}</span>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
              <dl>
                <div><dt>Duration</dt><dd>{program.durationWeeks} weeks</dd></div>
                <div><dt>Location</dt><dd>{program.location}</dd></div>
                <div><dt>Trainer</dt><dd>{program.trainerName}</dd></div>
                <div><dt>Slots</dt><dd>{program.availableSlots}</dd></div>
              </dl>
              <button
                className="primary-button"
                disabled={!staffProgramView && applied}
                onClick={() => (staffProgramView ? setSelectedProgram(program) : apply(program.id))}
                type="button"
              >
                {staffProgramView ? "View Details" : applied ? "Applied" : "Apply Now"}
              </button>
            </article>
          );
        }) : (
          <div className="empty-state program-empty-state">
            <p>{isTrainer && inApp ? "No programs are assigned to you yet." : "No active programs match your search."}</p>
          </div>
        )}
      </div>

      {selectedProgram ? (() => {
        const programStudents = applications
          .filter((item) => item.program.id === selectedProgram.id)
          .map((item) => item.applicant);
        return (
          <div className="modal-backdrop" role="presentation" onClick={() => setSelectedProgram(null)}>
            <article
              className="detail-modal program-detail-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="program-detail-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="detail-modal-heading">
                <div>
                  <span className="category-label">{categoryLabel(selectedProgram.category)}</span>
                  <h3 id="program-detail-title">{selectedProgram.title}</h3>
                </div>
                <button className="icon-action" onClick={() => setSelectedProgram(null)} type="button" aria-label="Close details">
                  <X size={16} />
                </button>
              </div>
              <p>{selectedProgram.description}</p>
              <dl className="detail-list">
                <div><dt>Duration</dt><dd>{selectedProgram.durationWeeks} weeks</dd></div>
                <div><dt>Capacity</dt><dd>{selectedProgram.capacity}</dd></div>
                <div><dt>Available slots</dt><dd>{selectedProgram.availableSlots}</dd></div>
                <div><dt>Trainer</dt><dd>{selectedProgram.trainerName}</dd></div>
                <div><dt>Location</dt><dd>{selectedProgram.location}</dd></div>
                <div><dt>Status</dt><dd>{selectedProgram.isActive ? "Active" : "Inactive"}</dd></div>
              </dl>
              <section className="program-students">
                <header className="program-students-heading">
                  <h4>Enrolled Students</h4>
                  <span className="program-students-count">
                    {programStudents.length} {programStudents.length === 1 ? "student" : "students"}
                  </span>
                </header>
                {programStudents.length ? (
                  <ul className="program-students-list">
                    {programStudents.map((student) => (
                      <li className="program-student-item" key={student.id}>
                        <div className="program-student-name">{student.fullName}</div>
                        <div className="program-student-meta">
                          <span>{student.email}</span>
                          {student.phone ? <span>{" \u00b7 "}{student.phone}</span> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="program-students-empty">No students have applied for this program yet.</p>
                )}
              </section>
            </article>
          </div>
        );
      })() : null}
    </section>
  );

  if (inApp) return content;
  return (
    <div className="site-page">
      <FloatingNav />
      {content}
    </div>
  );
}
