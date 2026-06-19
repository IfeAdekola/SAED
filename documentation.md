# NYSC SAED IMS Documentation

## Overview

NYSC SAED IMS is an Information Management System for the Skill Acquisition and Entrepreneurship Development programme. It supports corps member registration, SAED program browsing, applications, trainer review, program management, and admin-controlled trainer account creation.

The project is split into:

- `backend/`: Django API, database models, authentication, authorization, seed data, and management endpoints.
- `frontend/`: React app for public pages, authentication, dashboards, applications, program management, and user management.

Separate documentation also exists inside each app folder:

- Backend documentation: `backend/documentation.md`
- Frontend documentation: `frontend/documentation.md`

## Current Access Rules

- Corps members sign up from the public signup page with step-by-step registration (name, email, phone, password → state of origin, state of deployment, LGA of deployment).
- Trainers can self-register at `/trainer-signup` but require admin authorization before accessing most features.
- All users log in with email and password only. There is no separate admin sign-in tab.
- Admin accounts still exist, but they use the same login form as every other user.
- Admins can authorize/deauthorize trainers from the user management screen.
- Admins cannot create new admin accounts from the user management screen or API.
- Only admins can create new SAED programs. Trainers can update programs they are assigned to.
- Trainers are auto-assigned to programs they should manage via the `trainer` link on the `Program` model.
- Trainers and admins can manage applications for programs they are assigned to (admins see all programs).
- Trainers and admins do not apply to programs or submit applications.
- Trainers and admins use `/app/applications` to check student applications grouped by program.
- Trainers and admins use `/app/programs` to view program details instead of applying.
- Admins cannot deactivate or change the role of their own active admin account.
- Corps members can browse programs, apply, and track their own applications.
- Unauthorized trainers see a "Account Pending Authorization" page with payment status and a "Pay Authorization Fee" button (scaffolded for future Paystack integration).

## Project Structure

```text
SAED/
  backend/
    config/
      __init__.py
      settings.py
      urls.py
      wsgi.py
    requirements.txt
    saed/
      management/
        commands/
          fix_program_categories.py
          seed_saed.py
      migrations/
        0001_initial.py
        0002_alter_program_category.py
        0003_program_trainer.py
        __init__.py
      __init__.py
      admin.py
      apps.py
      models.py
      tests.py
      urls.py
      views.py
    db.sqlite3
    documentation.md
    manage.py
    venv/
  frontend/
    public/
      activities/
      dunis-logo.png
      dunis-logo-dark.png
      index.html
      nysc.png
      nysc-dark.png
    src/
      components/
        AppShell.jsx
        BackHome.jsx
        CampActivities.jsx
        DarkToggle.jsx
        FloatingNav.jsx
        PasswordInput.jsx
      data/
        activities.js
      lib/
        api.js
        auth.jsx
      pages/
        Activities.jsx
        ActivityDetail.jsx
        Applications.jsx
        Dashboard.jsx
        Forgot.jsx
        Home.jsx
        Login.jsx
        ManageApplications.jsx
        ManageUsers.jsx
        Opportunities.jsx
        ProgramEditor.jsx
        Programs.jsx
        Signup.jsx
        ManageApplications.test.jsx
        ManageUsers.test.jsx
        ProgramEditor.test.jsx
      index.js
      main.jsx
      styles.css
    documentation.md
    package.json
    package-lock.json
  Changes.md
  documentation.md
  README.md
```

## Main Features

### Public Website

The public website introduces the SAED IMS platform and gives users access to:

- Home page
- SAED program browsing
- Camp activities
- Individual activity detail page (`/activities/:id`)
- Opportunities
- Login
- Signup
- Forgot password page

### Authentication

Users log in through one shared email/password login form. The backend uses Django session authentication and stores user profile information in the `Profile` model.

Supported roles are:

- Corps Member
- Trainer
- Admin

Corps members can sign up publicly with step-by-step registration including Nigerian state and LGA dropdowns. Trainers can self-register at `/trainer-signup` but require admin authorization before accessing most features. Admin accounts are operational accounts and are not created from public signup or trainer management.

Password fields include an eye button for showing or hiding the typed password on login, signup, password reset, and trainer creation forms. The implementation lives in `frontend/src/components/PasswordInput.jsx` and is reused across forms.

### Dashboard

Authenticated users can access the protected dashboard at `/app`. The dashboard displays:

- Total active programs
- Total applications
- Pending applications
- Completed applications
- Featured programs
- Recent applications
- For trainers: the programs they are assigned to and the applications for each

Admin and trainer dashboards include broader application data. Corps member dashboards focus on the current user's applications.

### Program Browsing

Users can view active SAED programs. Programs include:

- Title
- Category
- Description
- Duration
- Capacity
- Available slots
- Trainer name (display) and assigned trainer account (link)
- Location

The frontend supports searching programs and filtering them by grouped categories such as technology, business, agriculture, creative, and vocational.

For corps members, program cards show `Apply Now` or `Applied`. For admins and trainers inside the app, program cards show `View Details`; the details dialog displays duration, capacity, available slots, trainer, location, and active status.

All program, opportunity, and camp activity cards show only the first sentence of descriptions using a `firstSentence()` helper. Full descriptions are available on the respective detail pages (`/programs/:id`, `/activities/:id`, and external opportunity links).

`availableSlots` is computed by the backend as `capacity - approved applications` and is never negative.

### Program Applications

Authenticated corps members can apply for a SAED program. The backend prevents the same user from applying to the same program more than once and rejects trainer/admin application submissions.

Application statuses are:

- Pending
- Approved
- Completed (immutable)
- Declined

For corps members, the applications page allows users to view submitted applications and track each status. For admins and trainers, `/app/applications` is a student application checking page that lists applications grouped and sorted by program.

Once an application is marked `completed`, only an admin can change its status. Trainers (and other non-admin staff) are blocked by the API, and the Django admin UI renders the `status` field readonly for completed records. On the frontend, trainers see the action buttons on `/app/manage-applications` disabled for completed applications, while admins can still approve, decline, or re-mark a completed application.

### Management

Admins and trainers can:

- Review applications for programs they are assigned to
- Approve, decline, or complete applications
- View student applications grouped by program from `/app/applications`
- View program details from `/app/programs`

Admins can additionally:

- Create and edit SAED programs (only admins can create; trainers can update programs they are assigned to)
- Activate or deactivate programs
- Create trainer accounts
- Authorize/deauthorize self-registered trainers
- Activate or deactivate user access

Admins cannot create another admin account through the user management API, and they cannot deactivate or change the role of their own active admin account.

### Camp Activities

The activities page displays NYSC orientation camp activity information, including registration, swearing-in, morning meditation, SAED activities, sports, social activities, intra-platoon activities, religious activities, and passing out parade. Each activity has a dedicated detail page at `/activities/:id`.

### Opportunities

The opportunities page lists 48 real, verified NYSC opportunity listings sourced from LinkedIn, MyJobMag, Jobberman, JobNow, NYSC Portal, and company career pages. Listings cover entry-level positions, internships, graduate trainee programmes, and PPA opportunities across Lagos, Abuja, Port Harcourt, Benin City, Edo, and nationwide. Sectors include tech/IT, finance/accounting, law, engineering/energy, professional services, marketing/sales, real estate, healthcare, oil & gas, and education. Each listing links to the original job posting for direct application.

### Theme Support

The frontend supports light and dark mode. The selected theme is stored in local storage, and the app also checks the system color scheme when no saved preference exists. The initial theme is applied before React mounts to prevent a flash of the wrong theme on hard refresh.

## Backend Documentation

### Backend Stack

- Django 6
- SQLite for local development
- Django session authentication
- Django CORS headers
- Django built-in `User` model with a custom `Profile` model for roles

### Important Backend Files

- `backend/config/settings.py`: Django settings, database configuration, CORS, CSRF, cookies, and production security flags.
- `backend/config/urls.py`: Root URL configuration.
- `backend/saed/models.py`: `Profile`, `Program`, and `Application` models.
- `backend/saed/views.py`: API handlers, authentication, authorization, validation, and JSON response formatting.
- `backend/saed/urls.py`: API route declarations.
- `backend/saed/admin.py`: Django admin registrations for profiles, programs, and applications.
- `backend/saed/tests.py`: Backend API tests.
- `backend/saed/management/commands/seed_saed.py`: Demo users and sample SAED programs. Restores the demo admin/trainer accounts and assigns the demo trainer to every seeded program.
- `backend/saed/management/commands/fix_program_categories.py`: One-off command to align historical program category values with the current choices. Dry-run by default; pass `--apply` to save the suggested updates.
- `backend/documentation.md`: Backend-only documentation.
- `backend/requirements.txt`: Python dependencies (Django + django-cors-headers).

### Data Models

#### Profile

Stores extra information for each Django user.

Fields:

- `user`: one-to-one link to Django `User`
- `role`: `corps_member`, `trainer`, or `admin`
- `phone`
- `nysc_state_code`
- `state_of_deployment`
- `state_of_origin`: Nigerian state where the corps member is from (used in signup)
- `lga_of_deployment`: Local Government Area of deployment (used in signup)
- `is_authorized`: boolean indicating if a trainer account is authorized (default `False` for self-registered trainers, `True` for admin-created trainers)
- `has_paid`: boolean indicating if the trainer has paid the authorization fee (scaffolded for future Paystack integration)
- `authorized_at`: timestamp when the trainer was authorized by an admin

#### Program

Stores SAED training program details.

Fields:

- `title`
- `category`
- `description`
- `duration_weeks`
- `capacity`
- `trainer`: foreign key to the Django `User` account assigned to run the program (nullable, set to `NULL` if the user is deleted)
- `trainer_name`: display name for the trainer (kept in sync when `trainer` is set; can also be set standalone for legacy programs)
- `location`
- `is_active`
- `created_at`

Program categories:

- Agro Allied
- Automobile
- Beautification
- Construction
- Cosmetology
- Culture & Tourism
- Education
- Environment
- Film & Photography
- Food Processing/Preservation
- ICT
- Power & Energy

#### Application

Stores a user's application to a program.

Fields:

- `applicant`
- `program`
- `status`
- `motivation`
- `created_at`

Each user can only apply once to the same program. Once an application's status becomes `completed`, it is final.

### API Endpoints

All backend API routes are under `/api/`.

| Endpoint | Method | Access | Description |
| --- | --- | --- | --- |
| `/api/health/` | GET | Public | Confirms the API is running. |
| `/api/csrf/` | GET | Public | Returns a CSRF token and sets the CSRF cookie. |
| `/api/auth/me/` | GET | Public | Returns the logged-in user or `null`. |
| `/api/auth/login/` | POST | Public | Logs in a user with email and password. |
| `/api/auth/logout/` | POST | Authenticated | Logs out the current user. |
| `/api/auth/signup/` | POST | Public | Creates a corps member account and profile. |
| `/api/auth/trainer-signup/` | POST | Public | Creates a trainer account (requires admin authorization). |
| `/api/auth/password-reset/` | POST | Public | Requests a password reset payload (uid/token). |
| `/api/auth/password-reset/confirm/` | POST | Public | Confirms a password reset. |
| `/api/dashboard/` | GET | Authenticated | Returns dashboard statistics, featured programs, recent applications, and (for trainers) their assigned programs. |
| `/api/programs/` | GET | Public | Returns active SAED programs and the list of category choices. |
| `/api/applications/` | GET | Corps Member | Returns applications submitted by the logged-in user. |
| `/api/applications/create/` | POST | Corps Member | Creates an application for a program. Trainers and admins are rejected. |
| `/api/manage/users/` | GET | Admin | Lists all users. |
| `/api/manage/users/` | POST | Admin | Creates a trainer account only. |
| `/api/manage/users/<id>/` | PATCH | Admin | Updates profile fields, corps member/trainer role, active status, or authorization status. Self role changes and self deactivation are blocked. |
| `/api/manage/programs/` | GET | Admin/Trainer | Lists programs (admins see all; trainers see only their assigned programs). Response also includes `trainers` (authorized trainer users) and `categories`. |
| `/api/manage/programs/` | POST | Admin | Creates a program. Trainers are rejected. |
| `/api/manage/programs/<id>/` | PATCH | Admin/Trainer | Updates a program. Trainers can only update their assigned programs. |
| `/api/manage/applications/` | GET | Admin/Trainer | Lists applications (admins see all; trainers see only their assigned programs). |
| `/api/manage/applications/<id>/` | PATCH | Admin/Trainer | Updates application status. Trainers cannot modify a `completed` application; admins can. |

### Backend Commands

Install Python dependencies from the project root (the requirements file lives at `backend/requirements.txt`):

```powershell
.\backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Run database migrations:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py migrate
```

Create migrations after model changes:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py makemigrations
```

Seed demo users and programs:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py seed_saed
```

The seed command resets the demo admin and trainer passwords to `password123`, restores their expected roles, ensures both demo accounts are active, and assigns the demo trainer to every seeded program.

Run Django checks:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py check
```

Run backend tests:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py test saed
```

Start the backend server:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8002
```

The API will run at:

```text
http://127.0.0.1:8002/api/
```

### Backend Environment Variables

- `DJANGO_DEBUG`: defaults to `true` locally.
- `DJANGO_SECRET_KEY`: required when `DJANGO_DEBUG=false`.
- `DJANGO_ALLOWED_HOSTS`: comma-separated allowed hosts.
- `CORS_ALLOWED_ORIGINS`: allowed frontend origins.
- `CSRF_TRUSTED_ORIGINS`: trusted origins for CSRF.
- `SQLITE_NAME`: optional SQLite database path.
- `DATABASE_ENGINE`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT`: optional external database settings.

## Frontend Documentation

### Frontend Stack

- React 19
- Create React App / `react-scripts`
- React Router with `HashRouter`
- Lucide React icons
- Plain CSS with comprehensive responsive layout (breakpoints at 1024px, 768px, 480px, 360px)

### Important Frontend Files

- `frontend/src/main.jsx`: App entry point, routes, protected route wrapper, and theme initialization.
- `frontend/src/lib/api.js`: Fetch wrapper for API requests. In development it prefers the same-origin `/api` proxy so Django session cookies are preserved.
- `frontend/src/lib/auth.jsx`: Auth context, session loading, login, signup, logout, and password reset helpers.
- `frontend/src/components/AppShell.jsx`: Authenticated app layout and navigation.
- `frontend/src/components/PasswordInput.jsx`: Reusable password field with an eye button for showing or hiding typed passwords.
- `frontend/src/components/CampActivities.jsx`: Reusable camp activities grid used by the public `/activities` page. Cards show only the first sentence of descriptions.
- `frontend/src/data/activities.js`: Static metadata (id, title, description, hero image, optional image gallery, optional `exploreHref` CTA) for each camp activity. Activities are referenced by `id` from the route `/activities/:id`.
- `frontend/src/pages/Login.jsx`: Shared login form for all account types. No admin sign-in selector is shown.
- `frontend/src/pages/Signup.jsx`: Corps member signup flow.
- `frontend/src/pages/ManageUsers.jsx`: Admin-only trainer account creation and user activation management.
- `frontend/src/pages/ProgramEditor.jsx`: Admin-only program management (create + edit).
- `frontend/src/pages/ManageApplications.jsx`: Admin/trainer application review with status filters. For trainers the action buttons are disabled for applications already marked `completed`; admins can still approve, decline, or re-mark a completed application.
- `frontend/src/pages/ActivityDetail.jsx`: Dedicated detail page for a single camp activity.
- `frontend/documentation.md`: Frontend-only documentation.

The API wrapper clears rotated CSRF tokens after login, signup, and logout. It also retries one time when Django returns a CSRF-specific `403`, which prevents stale `X-CSRFToken` headers after authentication changes.

The authenticated app navigation collapses into a hamburger menu on tablet and mobile widths to prevent horizontal overflow.

Password inputs on login, signup, password reset, and trainer creation use the reusable password visibility control.

### Frontend Routes

The frontend uses `HashRouter`, so browser URLs may include `#/`.

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Home page. |
| `/activities` | Public | Camp activities page. |
| `/activities/:id` | Public | Detail page for a single camp activity. |
| `/opportunities` | Public | Opportunities page. |
| `/forgot` | Public | Forgot password page. |
| `/login` | Public | Email/password login page. |
| `/signup` | Public | Corps member signup page. |
| `/trainer-signup` | Public | Trainer self-registration page. |
| `/programs` | Public | Public program browsing page. |
| `/app` | Protected | User dashboard. |
| `/app/programs` | Protected | Program browsing with application actions (corps member) or detail viewing (admin/trainer). |
| `/app/applications` | Corps Member | Application tracking. |
| `/app/manage-applications` | Admin/Trainer | Application review page with status filters. |
| `/app/program-editor` | Admin | Program creation and editing. |
| `/app/users` | Admin | Trainer account management page. |

### Frontend Commands

Install frontend dependencies:

```powershell
cd frontend
npm install
```

Start the frontend:

```powershell
cd frontend
npm start
```

Run frontend tests:

```powershell
cd frontend
npm test
```

Build the frontend:

```powershell
cd frontend
npm run build
```

The frontend will run at:

```text
http://127.0.0.1:3001/
```

### Frontend Proxy

`frontend/package.json` contains:

```json
"proxy": "http://127.0.0.1:8002"
```

During local development, frontend requests to `/api/...` are proxied to the Django server. This keeps session cookies attached after login.

The program editor page uses a compact sticky form on desktop so the creation/edit form fits inside the app viewport without internal form scrolling. On smaller screens, the layout returns to normal document flow for usability.

## Demo Accounts

Seed demo accounts with:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py seed_saed
```

Trainer:

```text
Email: trainer@saed.test
Password: password123
```

Admin:

```text
Email: admin@saed.test
Password: password123
```

The seed command also assigns the demo trainer to every seeded program, so logging in as the trainer immediately surfaces all seeded programs on the dashboard and application views.

Corps members can create their own accounts from the signup page.

## Typical Local Development Workflow

1. Install backend dependencies.
2. Run migrations.
3. Seed the database.
4. Start the backend on port `8002`.
5. Install frontend dependencies.
6. Start the frontend on port `3001`.
7. Open `http://127.0.0.1:3001/`.

## Testing Checklist

- Backend: run `.\backend\venv\Scripts\python.exe backend\manage.py test saed`.
- Frontend: run `cd frontend` then `npm test`.
- Manual checks:
  - Login page has no admin sign-in option.
  - Admin can log in with email/password.
  - Password fields can be shown and hidden with the eye button.
  - Login followed by `/api/dashboard/` does not return `401`.
  - Admin can create a trainer from `/app/users`.
  - Admin cannot create another admin from `/api/manage/users/`.
  - Admin cannot deactivate or demote their own admin account.
  - Small-screen authenticated navigation opens and closes through the hamburger button.
  - Admin and trainer users see `View Details` on `/app/programs`, not `Apply Now`.
  - Admin and trainer users cannot submit `/api/applications/create/`.
  - `/app/applications` shows student applications grouped by program for admin and trainer users.
  - Application status PATCH requests do not fail with stale CSRF headers after login.
  - Trainer cannot access `/app/users`.
  - Trainer cannot access `/app/program-editor`.
  - Trainers see only their assigned programs in `/app/programs` and `/app/applications`.
  - A trainer cannot change the status of a completed application through the API; an admin can.
  - On `/app/manage-applications`, the action buttons for a completed row are disabled for trainers and enabled for admins (only the redundant `Complete` button stays disabled).
  - `/activities/:id` opens a dedicated detail page for the matching camp activity.
  - Corps member can sign up, browse programs, apply, and view applications.

## Current Progress

Completed work:

1. Built the React landing page.
2. Added responsive styling.
3. Added light and dark mode support.
4. Fixed CSS display issues.
5. Built the Django backend.
6. Connected frontend fetching to the backend API.
7. Added authentication, programs, applications, dashboard data, camp activities, and opportunities.
8. Removed admin role selection from the login UI.
9. Restricted trainer account creation to admins.
10. Prevented admins/trainers from applying to programs.
11. Changed staff `/app/programs` actions to program detail viewing.
12. Changed staff `/app/applications` into a student application view grouped by program.
13. Made the program editor form compact and sticky on desktop.
14. Added CSRF token refresh/retry handling for authenticated write requests.
15. Added collapsible hamburger navigation for small authenticated screens.
16. Prevented admin self-deactivation and self-role changes.
17. Added password visibility eye buttons.
18. Updated the seed command to reactivate and restore demo admin/trainer accounts.
19. Linked programs to trainer accounts via the `Program.trainer` foreign key and updated the seed command to assign the demo trainer to every seeded program.
20. Restricted program creation to admins and scoped trainer views to their assigned programs.
21. Made completed applications immutable in the API, the Django admin, and the frontend review page.
22. Added a dedicated camp activity detail page and route that renders the activity's hero image, description, image gallery, and (where applicable) an `Explore Programs` CTA from `src/data/activities.js`.
23. Added frontend test files for `ManageApplications`, `ManageUsers`, and `ProgramEditor`.
24. Changed the `completed` application rule so that only admins can change a completed application. Trainers are blocked by the API and the frontend (`/app/manage-applications`); admins can still approve, decline, or re-mark a completed application.
25. Added first-sentence card truncation: program, opportunity, and camp activity cards show only the first sentence of descriptions; full descriptions are available on the respective detail pages.
26. Replaced Opportunities page data with 48 real NYSC job, internship, and graduate trainee listings from LinkedIn, MyJobMag, Jobberman, and company career pages.
27. Added comprehensive responsive CSS across breakpoints at 1024px, 768px, 480px, and 360px covering all pages (floating nav, hero, stats band, grids, dashboard sidebar, forms, modals, auth pages, and more).
28. Fixed hero background image path (replaced broken `../public/` CSS reference with a pure CSS gradient).
29. Added `prefers-reduced-motion`, landscape, and print media queries for accessibility.
30. Added trainer self-registration at `/trainer-signup` with authorization flow.
31. Added `is_authorized`, `has_paid`, and `authorized_at` fields to Profile model.
32. Added `state_of_origin` and `lga_of_deployment` fields to Profile model.
33. Added `require_authorized_trainer` decorator to block unauthorized trainers from dashboard, manage programs, and manage applications endpoints.
34. Added admin authorization/deauthorization of trainers from `/app/users`.
35. Added "Account Pending Authorization" page for unauthorized trainers with payment status and "Pay Authorization Fee" button (scaffolded).
36. Redesigned corps member signup flow: step 1 (name, email, phone, password), step 2 (state of origin, state of deployment, LGA of deployment dropdowns).
37. Created `frontend/src/data/nigerianStates.js` with complete dataset of all 37 Nigerian states and their 774 LGAs.
38. Added NYSC State Code text input field to corps member signup form, positioned before State of Deployment.
39. Updated Django admin `ProfileAdmin` to use dynamic `get_fieldsets()` that shows role-specific fields: Authorization section for trainers, Corps Member Details section for corps members.

## Production Notes

This project is currently configured for local development. Before production deployment:

- Move sensitive values such as `SECRET_KEY` into environment variables.
- Disable `DEBUG`.
- Configure production hosts.
- Use a production-ready database.
- Configure CORS and CSRF trusted origins for the deployed frontend.
- Serve the frontend build through a production web server.
- Confirm HTTPS so secure cookies and CSRF behavior work correctly.
- Create admin accounts through trusted operational processes, not public signup.
