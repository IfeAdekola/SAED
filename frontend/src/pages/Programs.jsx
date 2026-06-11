import { Search } from "lucide-react";
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
  vocational: ["automobile", "construction", "beautification", "cosmetology", "film_photography", "agro_allied"],
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
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const isTrainer = user?.role === "trainer";

  useEffect(() => {
    async function load() {
      const programData = await api(inApp && isTrainer ? "/manage/programs/" : "/programs/");
      setPrograms(programData.programs);
    }
    load();
  }, [inApp, isTrainer]);

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

  const detailsHref = (programId) => (inApp ? `/app/programs/${programId}` : `/programs/${programId}`);

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

      <div className="program-card-grid">
        {visiblePrograms.length ? visiblePrograms.map((program) => {
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
                onClick={() => navigate(detailsHref(program.id))}
                type="button"
              >
                View Details
              </button>
            </article>
          );
        }) : (
          <div className="empty-state program-empty-state">
            <p>{isTrainer && inApp ? "No programs are assigned to you yet." : "No active programs match your search."}</p>
          </div>
        )}
      </div>
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
