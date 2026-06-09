# NYSC SAED IMS

A React + Django information management system for NYSC Skill Acquisition and Entrepreneurship Development (SAED) programs.

The platform supports corps member registration, SAED program browsing, applications, trainer review, program management, and admin-controlled trainer account creation.

## Stack

- Backend: Django 6, SQLite, session auth, django-cors-headers
- Frontend: React 19, Create React App (react-scripts), React Router (HashRouter), lucide-react

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
- Home page
- SAED program browsing
- Camp activities listing and dedicated activity detail pages
- Opportunities
- Login, signup, and forgot password flows

### Authentication & Roles
- Single email/password login form shared by all roles.
- Roles: `corps_member`, `trainer`, `admin`.
- Corps members sign up publicly. Trainers are created by admins. Admin accounts are operational and not created from public signup or trainer management.
- Password fields include a visibility eye button (login, signup, password reset, trainer creation).

### Corps Member
- Browse active SAED programs with search and category filters.
- Apply to a program and track each application through its lifecycle.
- View their own applications at `/app/applications`.

### Trainer
- View program details (no apply) for programs they are assigned to.
- Review applications for their assigned programs at `/app/manage-applications`.
- **Cannot** change a `completed` application through the API or the frontend; the action buttons on completed rows are disabled.
- Cannot create new programs, create new admins, or access `/app/users`.

### Admin
- Everything trainers can do, across all programs.
- Create and edit SAED programs (`/app/program-editor`), with trainer assignment.
- Create and manage trainer accounts (`/app/users`).
- Approve, decline, complete, **and re-open** any application — admins are the only role that can change a `completed` application's status.

## Current Access Rules

- Corps members sign up from the public signup page.
- All users log in with email and password only. There is no separate admin sign-in tab.
- Only admins can create trainer accounts.
- Admins cannot create new admin accounts from the user management screen or API.
- Only admins can create new SAED programs. Trainers can update programs they are assigned to.
- Trainers are auto-assigned to programs they should manage via the `trainer` link on the `Program` model.
- Trainers and admins can manage applications for programs they are assigned to (admins see all programs).
- Trainers and admins do not apply to programs or submit applications.
- Trainers and admins use `/app/applications` to check student applications grouped by program.
- Trainers and admins use `/app/programs` to view program details instead of applying.
- Admins cannot deactivate or change the role of their own active admin account.
- Corps members can browse programs, apply, and track their own applications.
- **Once an application is marked `completed`, only an admin can change its status.** Trainers are blocked by the API and the frontend; admins can still approve, decline, or re-mark a completed application.

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

The frontend dev server proxies `/api/*` to the Django backend on port `8002`, so Django session cookies and CSRF work without extra configuration.

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

Corps members can sign up from `/signup`.

The seed command also assigns the demo trainer to every seeded program, so logging in as the trainer immediately surfaces all seeded programs on the dashboard and application views.

If the demo admin or trainer account becomes deactivated or its role is changed during testing, rerun `seed_saed` to restore it.

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
| `/api/dashboard/` | GET | Authenticated | Returns counts, featured programs, and recent applications. |
| `/api/programs/` | GET | Public | Lists active SAED programs and category choices. |
| `/api/applications/create/` | POST | Corps Member | Apply to a program. |
| `/api/manage/users/` | POST | Admin | Create a trainer account. |
| `/api/manage/programs/` | GET/POST | Admin/Trainer | List/create programs (POST is admin-only). |
| `/api/manage/programs/<id>/` | PATCH | Admin/Trainer | Update a program. |
| `/api/manage/applications/` | GET | Admin/Trainer | List applications. |
| `/api/manage/applications/<id>/` | PATCH | Admin/Trainer | Approve, decline, or complete an application. Trainers cannot modify a `completed` application; admins can. |

See [`backend/documentation.md`](./backend/documentation.md) for the full table.

## Documentation

- Full project documentation: see [`documentation.md`](./documentation.md)
- Backend documentation: see [`backend/documentation.md`](./backend/documentation.md)
- Frontend documentation: see [`frontend/documentation.md`](./frontend/documentation.md)
- Change log: see [`Changes.md`](./Changes.md)
