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

## 2026-06-14 — Trainer self-registration & authorization flow

- Added trainer self-registration at `/trainer-signup`. Trainers can now create their own accounts instead of being admin-created only.
- New `Profile` fields: `is_authorized` (default `False` for self-registered trainers, `True` for admin-created trainers), `has_paid` (scaffolded for future Paystack integration), `authorized_at` (timestamp set when admin authorizes).
- `require_authorized_trainer` decorator blocks unauthorized trainers from accessing dashboard, manage programs, manage applications, and manage application detail endpoints. Admins and corps members are unaffected.
- `/api/auth/trainer-signup/` endpoint creates trainer accounts with `is_authorized=False`. Admin-created trainers via `/api/manage/users/` default to `is_authorized=True`.
- `PATCH /api/manage/users/<id>/` now handles `isAuthorized` and `hasPaid` fields. Setting `isAuthorized=True` automatically records `authorized_at`.
- `trainers_payload()` filters by `is_authorized=True` so only authorized trainers appear in the trainer dropdown for program assignment.
- `user_payload()` returns `isAuthorized` and `hasPaid` fields.
- Unauthorized trainers see a full "Account Pending Authorization" page inside the app shell (sidebar remains visible). The page shows payment status and a "Pay Authorization Fee" button (scaffolded — shows alert for now).
- Admins can authorize/deauthorize trainers from `/app/users` with a new "Authorize" toggle button and authorization status column.
- Added `UnauthorizedPage.jsx` component and `TrainerSignup.jsx` page.
- Migration `0004` added `is_authorized`, `has_paid`, `authorized_at` to Profile. Migration `0005` added `state_of_origin` and `lga_of_deployment`.

## 2026-06-14 — Corps member signup redesign

- Moved password field from step 2 to step 1 of the corps member signup flow.
- Replaced NYSC State Code text input with State of Origin dropdown (36 states + FCT).
- Replaced State of Deployment text input with State of Deployment dropdown.
- Added conditional LGA of Deployment dropdown that only appears after State of Deployment is selected, populated with the correct LGAs for the chosen state.
- Created `frontend/src/data/nigerianStates.js` with complete dataset of all 37 Nigerian states and their 774 LGAs.
- Backend `signup_view` validates and saves `stateOfOrigin`, `stateOfDeployment`, and `lgaOfDeDeployment` instead of `nyscStateCode`.
- Added `state_of_origin` and `lga_of_deployment` fields to Profile model.
- Added "Want to teach? Sign up as a Trainer" link on the corps member signup page.
- `auth.jsx` now exposes `setUser` for direct user state updates from the trainer signup flow.

## 2026-06-14 — NYSC state code field & admin fieldsets

- Added NYSC State Code text input field to corps member signup form, positioned before State of Deployment.
- Updated Django admin `ProfileAdmin` to use dynamic `get_fieldsets()` that shows role-specific fields:
  - Trainers see: `is_authorized`, `has_paid`, `authorized_at` (Authorization section)
  - Corps members see: `state_of_origin`, `lga_of_deployment` (Corps Member Details section)
  - Admins see only basic fields (User Information, Contact, NYSC Details)

## 2026-06-14 — Major app redesign

### Auth Flow Redesign
- **Signup page**: Added role selector (Corps Member / Trainer) with card-based UI
- **Corps Member Signup**: 2-step flow - Step 1 (Account Info: Full Name, Email, Phone, State Code LA/26B/0123, LGA, Password), Step 2 (Skill Interest selection)
- **Trainer Signup**: Multi-step with LGA checkboxes (multi-select from 20 Lagos LGAs), specialization dropdown, years of experience, bio, company name, number trained
- **Login page**: Added role selector cards (Corps Member / Trainer) matching signup design
- **State Code Format**: Changed from free-text to `LA/26B/0123` format with regex validation

### New Backend Models
- **Course**: Trainers can create courses with title, description, price, duration, dates, fast track toggle
- **FastTrackVideo**: Video content for fast-track learning modules with pricing
- **Connection**: Links corps members to trainers (pending/active/completed/cancelled status)

### New Profile Fields
- `skill_interest`: Corps member's chosen skill area
- `specialization`: Trainer's single specialization
- `partner_lgas`: JSON array of LGAs the trainer serves
- `years_experience`: Trainer's years of experience
- `bio`: Trainer's professional bio
- `company_name`: Trainer's company name
- `number_trained`: Number of students trained
- `partnership_letter`: File upload for partnership letter
- `is_verified`: Admin verification status

### New Pages
- **FindTrainers**: Corps members search trainers by LGA and skill interest
- **ConnectTrainer**: Review trainer details and confirm connection
- **ConnectionSuccess**: Success page after connecting with trainer
- **CourseManagement**: Trainers create, edit, delete courses with fast track toggle
- **TrainerSignupSuccess**: Success page after trainer registration

### New API Endpoints
- `GET /api/trainers/`: Available trainers filtered by LGA and skill
- `POST /api/connect/`: Connect with a trainer
- `GET /api/connections/`: My connections (corps member)
- `GET /api/manage/courses/`: List trainer's courses
- `POST /api/manage/courses/`: Create a course
- `PATCH /api/manage/courses/<id>/`: Update a course
- `DELETE /api/manage/courses/<id>/`: Delete a course
- `GET /api/trainer/corpers/`: List corpers connected to trainer

### Styling Updates
- Added role selector card styles with green border on selection
- Added skill grid for interest selection
- Added LGA checkbox grid for trainer signup
- Added auth hero panel with green gradient background
- Added course management and trainer card styles
