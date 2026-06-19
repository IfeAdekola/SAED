# NYSC SAED IMS

A React + Django information management system for NYSC Skill Acquisition and Entrepreneurship Development (SAED) programs.

The platform supports corps member registration, SAED program browsing, applications, trainer review, program management, and admin-controlled trainer account creation.

## Stack

- Backend: Django 6, SQLite, session auth, django-cors-headers
- Frontend: React 19, Create React App (react-scripts), React Router (BrowserRouter), lucide-react, plain CSS with responsive layout

## Repository Layout

- `backend/` — Django project (`config/`) and the `saed` app, including models, API views, admin, tests, and seed data. Uses a local virtual environment at `backend/venv/`.
- `frontend/` — React application with public pages, authentication, dashboards, program browsing, application tracking, and admin/trainer management screens.
- `documentation.md` — Full project documentation.
- `backend/documentation.md` — Backend-only documentation.
- `frontend/documentation.md` — Frontend-only documentation.
- `Changes.md` — Change log.
- `backend/requirements.txt` — Python dependencies (Django + django-cors-headers).

## Features

### Public Website
- Home page with responsive gradient hero and stats band
- SAED program browsing with category tabs and search
- Camp activities listing and dedicated activity detail pages
- 48 real NYSC opportunity listings sourced from LinkedIn, MyJobMag, Jobberman, and company career pages
- Login, signup, and forgot password flows
- Fully responsive layout from 320px mobile to desktop

### Authentication & Roles
- Single email/password login form shared by all roles.
- Roles: `corps_member`, `trainer`, `saed_admin`, `dunis_admin`.
- Corps members sign up publicly with step-by-step registration including Nigerian state and LGA dropdowns.
- Trainers can self-register at `/trainer-signup` but require admin authorization before accessing most features.
- Admin accounts are operational and not created from public signup or trainer management.
- Password fields include a visibility eye button (login, signup, password reset, trainer creation).

### Card Description Behavior
- Program, opportunity, and camp activity cards show only the first sentence of descriptions.
- Full descriptions are displayed on the respective detail pages (`/programs/:id`, `/activities/:id`, and external opportunity links).

### Corps Member
- Browse active SAED programs with search and category filters.
- Apply to a program and track each application through its lifecycle.
- View their own applications at `/app/applications`.

### Trainer
- Self-register at `/trainer-signup` (requires admin authorization before full access).
- View program details (no apply) for programs they are assigned to.
- Review applications for their assigned programs at `/app/manage-applications`.
- **Cannot** change a `completed` application through the API or the frontend; the action buttons on completed rows are disabled.
- Cannot create new programs, create new admins, or access `/app/users`.
- Unauthorized trainers see a "Account Pending Authorization" page with payment status and a "Pay Authorization Fee" button (scaffolded for future Paystack integration).

### Admin (SAED Admin)
- Everything trainers can do, across all programs.
- Create and edit SAED programs (`/app/program-editor`), with trainer assignment.
- Create and manage trainer accounts (`/app/users`).
- Authorize/deauthorize self-registered trainers from the user management screen.
- Approve, decline, complete, **and re-open** any application — admins are the only role that can change a `completed` application's status.
- View and manage trainer fast track video access.

### DUNIS Admin
- View and manage payment verification for trainers.
- Enable/disable fast track access for trainers.
- Receive and respond to corps member complaints.
- View all registered trainers and corps members.

## Current Access Rules

- Corps members sign up from the public signup page with step-by-step registration (name, email, phone, password → state of origin, NYSC state code, state of deployment, LGA of deployment).
- Trainers can self-register at `/trainer-signup` but require admin authorization before accessing most features.
- All users log in with email and password only. There is no separate admin sign-in tab.
- SAED admins can authorize/deauthorize trainers from the user management screen.
- SAED admins cannot create new admin accounts from the user management screen or API.
- Only SAED admins can create new SAED programs. Trainers can update programs they are assigned to.
- Trainers are auto-assigned to programs they should manage via the `trainer` link on the `Program` model.
- Trainers and SAED admins can manage applications for programs they are assigned to (admins see all programs).
- Trainers and SAED admins do not apply to programs or submit applications.
- Trainers and SAED admins use `/app/applications` to check student applications grouped by program.
- Trainers and SAED admins use `/app/programs` to view program details instead of applying.
- SAED admins cannot deactivate or change the role of their own active admin account.
- Corps members can browse programs, apply, track their own applications, connect with trainers, and submit complaints.
- **Once an application is marked `completed`, only a SAED admin can change its status.** Trainers are blocked by the API and the frontend; admins can still approve, decline, or re-mark a completed application.
- Unauthorized trainers see a "Account Pending Activation" page with payment status and a "Pay Authorization Fee" button.
- Corps members can select trainers during onboarding or later from the Trainers tab.
- Trainers can create courses and upload fast track videos (if authorized by admin).
- Notifications are sent for program restrictions, connection requests, and admin updates.
- Non-admin users do not see admin-update notifications.

## Run Locally

Backend (run from the project root):

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py migrate
.\backend\venv\Scripts\python.exe backend\manage.py seed_saed
.\backend\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8002
```

The first time, also install Python dependencies:

```powershell
.\backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Frontend (run from the project root):

```powershell
cd frontend
npm install
npm start
```

Open:

```text
http://127.0.0.1:3001/
```

The frontend dev server proxies `/api/*` to the Django backend on port `8002` via `setupProxy.js` with cookie domain rewriting, so Django session cookies and CSRF work without extra configuration.

## Demo Accounts

After running `seed_saed`:

Admin:

```text
admin@saed.test
password123
```

Trainer:

```text
trainer@saed.test
password123
```

Corps Member:

```text
member@saed.test
password123
```

Corps members can also sign up from `/signup`.

The seed command also creates a demo corps member, authorizes the demo trainer (with payment verified), and assigns the trainer to every seeded program, so logging in as the trainer immediately surfaces all seeded programs on the dashboard and application views.

If any demo account becomes deactivated or its role is changed during testing, rerun `seed_saed` to restore it.

## Useful Commands

Backend:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py check
.\backend\venv\Scripts\python.exe backend\manage.py makemigrations
.\backend\venv\Scripts\python.exe backend\manage.py migrate
.\backend\venv\Scripts\python.exe backend\manage.py seed_saed
.\backend\venv\Scripts\python.exe backend\manage.py test saed
```

Frontend:

```powershell
cd frontend
npm start
npm test
npm run build
```

The backend test suite includes coverage for the admin-only override of completed applications, admin self-protection, trainer scoping, and program management rules.

## API Quick Reference

All routes live under `/api/`. Key endpoints:

| Endpoint | Method | Access | Purpose |
| --- | --- | --- | --- |
| `/api/health/` | GET | Public | Confirms the API is running. |
| `/api/auth/login/` | POST | Public | Logs in with email and password. |
| `/api/auth/signup/` | POST | Public | Creates a corps member account. |
| `/api/auth/trainer-signup/` | POST | Public | Creates a trainer account (requires admin authorization). |
| `/api/dashboard/` | GET | Authenticated | Returns counts, featured programs, and recent applications. |
| `/api/programs/` | GET | Public | Lists active SAED programs and category choices. |
| `/api/applications/create/` | POST | Corps Member | Apply to a program. |
| `/api/manage/users/` | POST | Admin | Create a trainer account. |
| `/api/manage/programs/` | GET/POST | Admin/Trainer | List/create programs (POST is admin-only). |
| `/api/manage/programs/<id>/` | PATCH | Admin/Trainer | Update a program. |
| `/api/manage/applications/` | GET | Admin/Trainer | List applications. |
| `/api/manage/applications/<id>/` | PATCH | Admin/Trainer | Approve, decline, or complete an application. Trainers cannot modify a `completed` application; admins can. |
| `/api/manage/courses/` | GET/POST | Trainer | List/create courses. |
| `/api/courses/` | GET | Authenticated | List active courses. |
| `/api/trainers/` | GET | Authenticated | List authorized trainers. |
| `/api/connect/` | POST | Corps Member | Request connection with a trainer. |
| `/api/connections/` | GET | Authenticated | List connections. |
| `/api/notifications/` | GET | Authenticated | List notifications. |
| `/api/submit-complaint/` | POST | Authenticated | Submit complaint to DUNIS admin. |
| `/api/paystack/initialize/` | POST | Authenticated | Initialize Paystack payment. |
| `/api/paystack/verify/` | POST | Authenticated | Verify Paystack payment. |

See [`backend/documentation.md`](./backend/documentation.md) for the full table.

## Documentation

- Full project documentation: see [`documentation.md`](./documentation.md)
- Backend documentation: see [`backend/documentation.md`](./backend/documentation.md)
- Frontend documentation: see [`frontend/documentation.md`](./frontend/documentation.md)
- Change log: see [`Changes.md`](./Changes.md)
