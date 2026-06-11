import FloatingNav from "../components/FloatingNav.jsx";

const opportunities = [
  {
    title: "NYSC SAED Skills Acquisition & Entrepreneurship Department",
    type: "Official NYSC",
    location: "Nationwide (all 36 states + FCT)",
    description:
      "The official NYSC directorate page for the Skills Acquisition & Entrepreneurship Development (SAED) programme, with details on in-camp training, post-camp tracks, the new December 2025 software / AI / mobile app curriculum, mentorship, and the NYSC-BOI MSME loan facility that all mobilised corps members are eligible to apply for.",
    url: "https://www.nysc.gov.ng/saed.html",
  },
  {
    title: "NYSC SAEDConnect Opportunity Centre",
    type: "Official NYSC",
    location: "Online, nationwide",
    description:
      "NYSC's online partner hub for grants, scholarships, competitions, loan schemes, business incubation, mentorship and job-readiness resources aimed at serving corps members and recent graduates. Register with your NYSC call-up number to access curated partner opportunities and track applications in one place.",
    url: "https://www.nysc.gov.ng/saedconnect.html",
  },
  {
    title: "NHIS Enrolment for Corps Members",
    type: "Benefit",
    location: "Orientation camp / state secretariat",
    description:
      "NYSC-managed route to enrol every serving corps member in the National Health Insurance Scheme (NHIS) for the duration of service, with cover starting from orientation camp. The official page explains eligibility, the documents to bring, and how to access care at NHIA-accredited facilities in your PPA state.",
    url: "https://www.nysc.gov.ng/nhia.html",
  },
  {
    title: "NYSC Graduate Trainee & Internship Job Board (MyJobMag)",
    type: "Job board",
    location: "Nigeria (mostly Lagos & Abuja)",
    description:
      "Frequently refreshed list of NYSC PPA, graduate trainee and one-year internship openings from Nigerian employers. Filter by 'Nysc Graduate Trainee Internship' to see live roles at companies like Starsight Energy, Algorism, Mikado, Victoria Waterfront, and Zotmann International — each with the original posting link.",
    url: "https://www.myjobmag.com/jobs-by-title/nysc-graduate-trainee-internship",
  },
  {
    title: "Starsight Energy NYSC Graduate Internship (Field Engineering & HR)",
    type: "Internship",
    location: "Lagos, Rivers, Sokoto, Abuja, Oyo, Imo, Yola",
    description:
      "One-year graduate internship for current NYSC corps members and 2026 Batch A2 / B1 Prospective Corps Members eligible for deployment to listed states. Streams open in Field Engineering (Physics / Electrical / Electronic Engineering) and HR, with hands-on exposure to commercial and industrial renewable energy projects across Africa.",
    url: "https://starsightenergy.seamlesshiring.com/job/view/8132",
  },
  {
    title: "8th National MSME Awards (Federal Ministry of Youth Initiatives)",
    type: "Government award",
    location: "Nigeria",
    description:
      "Annual federal awards recognising outstanding micro, small and medium enterprises run by Nigerian youth. Recent graduate entrepreneurs — including ex-corps members who scaled a SAED start-up — are eligible to apply across categories such as agribusiness, creative services, and tech, with cash prizes, mentoring and visibility from the Office of the Special Assistant to the President on Youth Initiatives.",
    url: "https://yid.fmyd.gov.ng/8th-national-msme-awards-applications/",
  },
  {
    title: "Federal Youth Initiative — NYSC SAED Programme Overview",
    type: "Government programme",
    location: "Nationwide",
    description:
      "Detailed step-by-step overview of the SAED programme: how in-camp and post-camp training work, the December 2025 curriculum updates (software development, AI, mobile apps, fashion, food processing, solar, agribusiness, photography), and how to access business grants (₦50,000 – ₦500,000), startup kits, mentorship and the NYSC-BOI MSME loan facility.",
    url: "https://yid.fmyd.gov.ng/nysc-saed-skills-acquisition-entrepreneurship-development-programme/",
  },
  {
    title: "MyJobMag Career Kickstart Scholarship 2026",
    type: "Scholarship",
    location: "Nigeria (online training + on-site modules)",
    description:
      "Second edition of the Career Kickstart Scholarship from MyJobMag, following a successful 2025 pilot. Targets recent graduates and serving corps members, with a free training track in CV writing, interview prep, job search strategy and AI-for-job-seekers, plus recognition certificates that can be added to a LinkedIn profile or CV.",
    url: "https://www.myjobmag.com/blog/myjobmag-career-kickstart-scholarship-2026-training-report-highlights-2",
  },
  {
    title: "Lagos State Employment Trust Fund (LSETF) Loan Programmes",
    type: "Loan scheme",
    location: "Lagos State (residency required)",
    description:
      "Lagos State Government fund offering low-interest loans to Lagos-based entrepreneurs, startups and small businesses, with a dedicated 'NYSC Corpers' track historically available for serving corps members serving in Lagos. Funds can be used for working capital, equipment, or product/service launch — useful as a follow-on to a SAED business grant.",
    url: "https://lsetf.ng/",
  },
  {
    title: "Bank of Industry (BOI) Youth Entrepreneurship Support (YES)",
    type: "Loan scheme",
    location: "Nationwide",
    description:
      "Federal Government / Bank of Industry programme providing single-digit interest loans to young Nigerian entrepreneurs aged 18–35, with a 50,000 naira application fee that goes directly into the loan amount. Corps members with a viable business plan — including those who emerged from SAED training — are eligible to apply at any BOI state office.",
    url: "https://www.boi.ng/loan-products/youth-entrepreneurship-support-yes-programme/",
  },
  {
    title: "NYSC SAED Business Grants — How to Apply Guide",
    type: "Grant guide",
    location: "Orientation camp / online",
    description:
      "Step-by-step practical guide for corps members on how to access SAED business grants during orientation camp: how to register and participate actively, draft a viable business proposal, pitch at in-camp competitions, and qualify for grant funding of ₦50,000 – ₦500,000 or free startup kits. Useful even when an official grant window has closed, since the steps are stable year-to-year.",
    url: "https://nyscpioneers.com/2025/05/09/how-corps-members-can-apply-for-nysc-saed-business-grants/",
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
            <p>Jobs, internships, grants, scholarships, and business resources for NYSC corps members.</p>
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
