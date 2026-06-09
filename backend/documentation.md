# Backend Documentation

## Overview

The backend is a Django API for the NYSC SAED IMS. It handles authentication, user profiles, program records, corps member applications, dashboard data, trainer/admin management workflows, and seeded demo data.

## Backend Stack

- Django 6
- SQLite for local development
- Django session authentication
- Django CORS headers
- Django built-in `User` model with a custom `Profile` model for roles

## File Structure

```text
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
```

## Important Files

- `config/settings.py`: Django settings, database configuration, CORS, CSRF, cookies, and production security flags.
- `config/urls.py`: Root URL configuration.
- `saed/models.py`: `Profile`, `Program`, and `Application` models.
- `saed/views.py`: API handlers, authentication, authorization, validation, and JSON response formatting.
- `saed/urls.py`: API route declarations.
- `saed/admin.py`: Django admin registrations for profiles, programs, and applications.
- `saed/tests.py`: Backend API tests.
- `saed/management/commands/seed_saed.py`: Demo users and sample SAED programs. Also assigns the demo trainer account to every seeded program.
- `saed/management/commands/fix_program_categories.py`: One-off command to align historical program category values with the current choices. Dry-run by default; pass `--apply` to save the suggested updates.

## Models

### Profile

Stores extra information for each Django user.

Fields:

- `user`: one-to-one link to Django `User`
- `role`: `corps_member`, `trainer`, or `admin`
- `phone`
- `nysc_state_code`
- `state_of_deployment`

### Program

Stores SAED training programs.

Fields:

- `title`
- `category`
- `description`
- `duration_weeks`
- `capacity`
- `trainer`: nullable foreign key to the Django `User` account assigned to run the program. Deleting the user nulls this field (`on_delete=SET_NULL`). Reverse name: `training_programs`.
- `trainer_name`: free-form display name for the trainer. The API keeps it in sync with `trainer.get_full_name()` (or email/username as a fallback) when `trainer` is set, so existing reads and seeded data still work.
- `location`
- `is_active`
- `created_at`

### Application

Stores a corps member application to a program.

Fields:

- `applicant`
- `program`
- `status`: `pending`, `approved`, `completed`, or `declined`
- `motivation`
- `created_at`

Only corps members can submit applications. Each applicant can apply to the same program only once.

## API Endpoints

All backend routes are under `/api/`.

| Endpoint | Method | Access | Purpose |
| --- | --- | --- | --- |
| `/api/health/` | GET | Public | Check API health. |
| `/api/csrf/` | GET | Public | Set and return CSRF token. |
| `/api/auth/me/` | GET | Public | Return current session user or `null`. |
| `/api/auth/login/` | POST | Public | Log in with email and password. |
| `/api/auth/logout/` | POST | Authenticated | Log out current user. |
| `/api/auth/signup/` | POST | Public | Create a corps member account. |
| `/api/auth/password-reset/` | POST | Public | Request a password reset (returns uid/token for the requested email if it exists). |
| `/api/auth/password-reset/confirm/` | POST | Public | Confirm password reset with uid/token. |
| `/api/dashboard/` | GET | Authenticated | Return dashboard counts and recent data. For trainers the response also includes a `trainerPrograms` array (each with their nested `applications`). |
| `/api/programs/` | GET | Public | Return active programs and the list of category choices. |
| `/api/applications/` | GET | Corps Member | Return the current user's applications. Trainers and admins are rejected. |
| `/api/applications/create/` | POST | Corps Member | Apply to a program. Trainer and admin accounts are rejected. |
| `/api/manage/users/` | GET | Admin | List all users (with profile data, including role and active status). |
| `/api/manage/users/` | POST | Admin | Create a trainer account only. |
| `/api/manage/users/<id>/` | PATCH | Admin | Update user profile fields, role to `corps_member`/`trainer`, or active status. Self role changes and self deactivation are blocked. |
| `/api/manage/programs/` | GET | Admin/Trainer | List programs (admins see all; trainers see only programs they are assigned to). Response also includes `trainers` (active trainer users) and `categories`. |
| `/api/manage/programs/` | POST | Admin | Create a program. Trainer accounts are rejected. |
| `/api/manage/programs/<id>/` | PATCH | Admin/Trainer | Update a program. Trainers can only update programs they are assigned to. |
| `/api/manage/applications/` | GET | Admin/Trainer | List all applications. Trainers see only applications for programs they are assigned to. |
| `/api/manage/applications/<id>/` | PATCH | Admin/Trainer | Approve, decline, or complete an application. Trainers cannot modify a `completed` application; admins can override the immutability. |

## Program payload

`Program` instances are serialized to the frontend with the following shape:

```json
{
  "id": 1,
  "title": "ICT Fundamentals & Web",
  "category": "ict",
  "description": "...",
  "durationWeeks": 8,
  "capacity": 60,
  "trainerId": 12,
  "trainerName": "SAED Trainer",
  "location": "Computer Lab",
  "availableSlots": 58,
  "isActive": true
}
```

`availableSlots` is computed as `max(capacity - approved applications, 0)`.

## Application status rules

- The API endpoint `/api/manage/applications/<id>/` accepts `approved`, `declined`, and `completed` updates from staff users.
- Completed applications are immutable for non-admin staff: trainers cannot move a `completed` application to another status through the API. Admins can still update or revert a completed application.
- The Django admin UI treats completed applications as immutable: admin bulk actions skip completed records and the `status` field is rendered readonly for completed applications.
- The `completed` immutability rule is enforced both at the API and the Django admin layer, but only admins can override it via the API.

## Access Rules

- Login accepts email and password only.
- Public signup creates corps member accounts only.
- Admin users can create trainer accounts.
- Admin users cannot create another admin account through the API.
- Admin users cannot deactivate their own account or change their own role through the API.
- Trainers and admins can manage programs and applications.
- Only admins can create new programs. Trainers can update programs they are assigned to and review their applications.
- Trainers and admins cannot apply to programs or submit applications.
- Trainers and admins can list all submitted student applications through `/api/manage/applications/`.
- Trainer accounts are auto-restored to the expected state by the `seed_saed` management command.
- Corps members can apply to programs and view their own applications.

## CSRF Notes

The frontend calls `/api/csrf/` to get a token and sends it as `X-CSRFToken` for write requests. Django rotates CSRF tokens around authentication changes, so the frontend clears cached CSRF values after login, signup, and logout, and retries once if Django returns a CSRF-specific `403`.

## Commands

Run these from `SAED/` (the project root) unless stated otherwise. The venv lives at `backend/venv/`.

Install Python dependencies (the requirements file lives at `backend/requirements.txt`):

```powershell
.\backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Run migrations:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py migrate
```

Create migrations after model changes:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py makemigrations
```

Seed demo data:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py seed_saed
```

This command restores the demo admin and trainer accounts to active status, resets their passwords to `password123`, restores their expected roles, and assigns the demo trainer account to every seeded program.

Run Django checks:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py check
```

Run backend tests:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py test saed
```

The backend test suite includes coverage for rejecting admin program applications, admin self-deactivation, admin self-role-protection (via the deactivation test), trainer-scoped program/application access, trainer program editing restrictions, the public signup role rules, and the `completed` application immutability rule (trainers blocked, admins allowed).

Start backend server:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8002
```

Backend API URL:

```text
http://127.0.0.1:8002/api/
```

## Environment Variables

- `DJANGO_DEBUG`: defaults to `true` locally.
- `DJANGO_SECRET_KEY`: required when `DJANGO_DEBUG=false`.
- `DJANGO_ALLOWED_HOSTS`: comma-separated allowed hosts.
- `CORS_ALLOWED_ORIGINS`: allowed frontend origins.
- `CSRF_TRUSTED_ORIGINS`: trusted origins for CSRF.
- `SQLITE_NAME`: optional SQLite database path.
- `DATABASE_ENGINE`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT`: optional external database settings.

## Demo Accounts

Seed demo accounts with:

```powershell
.\backend\venv\Scripts\python.exe backend\manage.py seed_saed
```

Admin:

```text
Email: admin@saed.test
Password: password123
```

Trainer:

```text
Email: trainer@saed.test
Password: password123
```

If the demo admin or trainer account cannot log in, or its role/active status has been changed, rerun `seed_saed` to restore it.

## Production Notes

- Set `DJANGO_DEBUG=false`.
- Set `DJANGO_SECRET_KEY`.
- Configure allowed hosts, CORS origins, and CSRF trusted origins.
- Use a production database instead of local SQLite.
- Run migrations before serving production traffic.
- Create admin accounts through trusted operational processes.
