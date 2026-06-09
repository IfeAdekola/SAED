import FloatingNav from "../components/FloatingNav.jsx";

const opportunities = [
  {
    title: "NYSC SAEDConnect Opportunity Centre",
    type: "Official NYSC",
    location: "Nationwide",
    description: "Access NYSC partner opportunities, grants, scholarships, competitions, loan schemes, business incubation programs, mentorship, and job-readiness resources.",
    url: "https://www.nysc.gov.ng/saedconnect.html",
  },
  {
    title: "NYSC Graduate Trainee and Internship Listings",
    type: "Job board",
    location: "Nigeria",
    description: "A frequently updated list of NYSC, graduate trainee, and internship openings across Nigerian employers.",
    url: "https://www.myjobmag.com/jobs-by-title/nysc-graduate-trainee-internship",
  },
  {
    title: "Graduate Intern NYSC Roles at Starsight Energy",
    type: "Internship",
    location: "Nigeria",
    description: "One-year internship opportunities for current NYSC members and 2026 Batch A PCMs in field engineering, legal, and related teams.",
    url: "https://starsightenergy.seamlesshiring.com/job/view/8132?application_source=Direct",
  },
  {
    title: "Standard Chartered Graduate Internship Program",
    type: "Graduate internship",
    location: "Nigeria",
    description: "NYSC-focused graduate internship route for eligible corps members interested in finance, operations, and business exposure.",
    url: "https://www.jobsregion.com/standard-chartered-bank-graduate-internship-program/",
  },
  {
    title: "SAED Business Grants Guide",
    type: "Grant guide",
    location: "Orientation camp / online",
    description: "Practical guidance on preparing for SAED business grant opportunities, pitching ideas, and following camp-based announcements.",
    url: "https://nyscpioneers.com/2025/05/09/how-corps-members-can-apply-for-nysc-saed-business-grants/",
  },
  {
    title: "Federal Youth Initiative SAED Programme",
    type: "Government programme",
    location: "Nationwide",
    description: "Overview of SAED training, entrepreneurship development, digital skills, mentorship, and funding opportunity pathways.",
    url: "https://yid.fmyd.gov.ng/nysc-saed-skills-acquisition-entrepreneurship-development-programme/",
  },
];

export default function Opportunities() {
  return (
    <div className="site-page">
      <FloatingNav />
      <section className="panel full-panel opportunities-panel">
        <div className="panel-heading">
          <div>
            <h2>Opportunities</h2>
            <p>Jobs, internships, grants, and business resources for NYSC corps members.</p>
          </div>
        </div>

        <div className="opportunity-grid">
          {opportunities.map((item) => (
            <article className="opportunity-card" key={item.title}>
              <span className="category-label">{item.type}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="opportunity-meta">{item.location}</div>
              <a className="primary-button" href={item.url} target="_blank" rel="noreferrer">
                View Opportunity
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
