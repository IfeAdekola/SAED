import { useEffect, useState } from "react";

import activities from "../data/activities";

function truncateText(value, maxLength) {
  if (!value || value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

export default function CampActivities() {
  const [singleColumn, setSingleColumn] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 600px)");

    function update(event) {
      setSingleColumn(event.matches);
    }

    update(query);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <section className="activities-section" id="activities">
      <div className="section-heading">
        <h2>Camp Activities</h2>
        <p>Activities commonly held at NYSC Orientation Camp.</p>
      </div>
      <div className="activities-grid">
        {activities.map((a) => (
          <article key={a.id} className="activity-card">
            <img src={a.image} alt={a.title} />
            <div className="card-body">
              <h3>{a.title}</h3>
              <p>{singleColumn ? truncateText(a.description, 200) : a.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
