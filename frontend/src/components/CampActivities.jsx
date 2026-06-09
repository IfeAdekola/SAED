import { Link } from "react-router-dom";

import activities from "../data/activities";

function truncateText(value, maxLength) {
  if (!value || value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

export default function CampActivities() {
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
              <p>{truncateText(a.description, 100)}</p>
              <Link
                className="primary-button activity-learn-more"
                to={`/activities/${a.id}`}
              >
                Learn More
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
