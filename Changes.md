## Completed Improvements

Implemented in this update:

1. Added trainer and admin management pages.
2. Allowed admins or trainers to approve, decline, and complete applications.
3. Added program creation and editing screens.
4. Added password reset functionality.
5. Added stronger production settings for secrets, allowed hosts, database, and deployment.
6. Added automated backend and frontend tests.
7. Added form validation improvements and clearer error messages.

## 2026-06-08 — Application immutability & UI filters

- Once an application is marked `completed`, its status is immutable via the API and the Django admin UI.
- Django admin actions now skip completed applications and render the `status` field readonly when viewing completed applications.
- Frontend: added a `Pending` filter and filters for Approved/Declined/Completed on `/app/manage-applications`; action buttons are disabled for completed applications and new CSS classes were added for the filter controls.

## 2026-06-08 — Trainer-assigned programs & activity detail

- `Program` model gained a nullable `trainer` foreign key to the Django `User` model (migration `0003_program_trainer`).
- `/api/manage/programs/` now returns the list of active trainer users and the list of program categories alongside the programs.
- `/api/manage/programs/` `POST` is now admin-only; trainers can only update programs they are assigned to.
- Trainers see only their assigned programs and applications across the API, dashboard, and the relevant pages.
- `seed_saed` now assigns the demo trainer account to every seeded program.
- Added a dedicated `/activities/:id` detail page that reuses the `CampActivities` grid component.

## 2026-06-09 — Documentation refresh

- `README.md`: corrected backend stack to Django 6, fixed the venv path (`backend/venv/`), and clarified the local run/test commands.
- `documentation.md`: added the `Program.trainer` foreign key, documented the `/api/manage/programs/` `trainers` payload, restricted program creation to admins, added `/activities/:id` to the route table, and recorded recent completed work.
- `backend/documentation.md`: documented the new `trainer` field and its reverse name, the `Program` payload (including `trainerId`/`trainerName`/`availableSlots`), trainer-scoped program/application endpoints, the immutability of completed applications, and the demo-trainer assignment in `seed_saed`.
- `frontend/documentation.md`: documented the `PasswordInput` and `CampActivities` reusable components, the new `/activities/:id` route, the admin-only `/app/program-editor` route, trainer-scoped program views, the trainer dashboard `trainerPrograms` section, and the new frontend test files.
- `Changes.md`: added this entry.

## 2026-06-09 — Completed applications: admin-only override

- Backend (`backend/saed/views.py`): the `PATCH /api/manage/applications/<id>/` endpoint now only blocks non-admin staff (trainers) from changing a `completed` application. Admins can still update or revert a completed application's status.
- Backend tests (`backend/saed/tests.py`): added `test_trainer_cannot_change_completed_application` (verifies trainer PATCH is rejected with `400` and the status stays `completed`) and `test_admin_can_change_completed_application` (verifies admin PATCH succeeds and the status is updated). All 21 backend tests pass.
- Frontend (`frontend/src/pages/ManageApplications.jsx`): action buttons for completed applications are now only disabled for trainers; admins see the row's `Approve` and `Decline` buttons enabled (the redundant `Complete` button stays disabled because the row is already `completed`). The component reads the current role from `useAuth`.
- Frontend tests (`frontend/src/pages/ManageApplications.test.jsx`): updated to mock `useAuth` and added two new tests covering the trainer-disabled and admin-enabled cases for completed applications.
- Documentation: updated `documentation.md`, `backend/documentation.md`, and `frontend/documentation.md` to describe the new admin-override rule (Program Applications section, API table, `Application status rules`, `Role-Based Screens`, Testing Checklist, and Current Progress item 24).

## 2026-06-13 — Card description truncation

- Programs, Opportunities, and Camp Activities cards now show only the first sentence of descriptions.
- Full descriptions are still available on the detail pages (`/programs/:id`, `/activities/:id`, and the external opportunity links).
- A shared `firstSentence()` helper extracts the first sentence using a period-delimited regex; falls back to 120 characters with an ellipsis if no period is found.

## 2026-06-13 — Real NYSC opportunity listings

- Replaced the Opportunities page static data with 48 real, verified NYSC opportunity listings sourced from LinkedIn, MyJobMag, Jobberman, JobNow, NYSC Portal, and company career pages.
- Listings cover entry-level positions, internships, graduate trainee programmes, and PPA opportunities across Lagos, Abuja, Port Harcourt, Benin City, Edo, and nationwide.
- Sectors include tech/IT, finance/accounting, law, engineering/energy, professional services, marketing/sales, real estate, healthcare, oil & gas, and education.
- Each listing links to the original job posting for direct application.

## 2026-06-13 — Full site responsive redesign

- Added comprehensive responsive CSS with breakpoints at 1024px, 768px, 480px, and 360px covering every page of the site.
- **FloatingNav**: Shrinks on mobile, hamburger menu appears at ≤680px, ultra-compact layout at ≤360px.
- **Hero section**: Stacks buttons vertically, reduces heading and padding on small screens, min-height scales from 700px down to 480px.
- **Stats band**: 3 columns on desktop, single column on mobile.
- **Feature/program/activity/opportunity grids**: Gracefully cascade from 3 columns to 2 to 1.
- **Dashboard sidebar**: Becomes a sticky top bar with hamburger toggle on mobile.
- **Forms and management rows**: Stack to single-column layouts on narrow screens.
- **Modals**: Full-width with reduced padding on small screens.
- **Auth pages**: Panel fills screen width on mobile with tighter padding.
- **Activity detail and program detail**: Single-column layouts, reduced image heights, smaller fonts on mobile.
- **Category tabs**: Horizontal scroll with snap on mobile instead of wrapping.
- Added `prefers-reduced-motion` media query to disable hover animations for accessibility.
- Added landscape phone and print media queries.
- Fixed hero background image path (was referencing `../public/` which fails in CRA builds; replaced with a pure CSS gradient).

## 2026-06-13 — Documentation update

- Updated `README.md`, `documentation.md`, `frontend/documentation.md`, and `Changes.md` to reflect card truncation, real opportunity listings, responsive redesign, and hero image fix.
