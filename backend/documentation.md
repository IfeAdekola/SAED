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
  saed/
    management/
      commands/
        fix_program_categories.py
        seed_saed.py
    migrations/
      0001_initial.py
      0002_alter_program_category.py
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
- `saed/management/commands/seed_saed.py`: Demo users and sample SAED programs.

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
- `trainer_name`
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
| `/api/auth/password-reset/` | POST | Public | Request a password reset payload. |
| `/api/auth/password-reset/confirm/` | POST | Public | Confirm password reset. |
| `/api/dashboard/` | GET | Authenticated | Return dashboard counts and recent data. |
| `/api/programs/` | GET | Public | Return active programs and categories. |
| `/api/applications/` | GET | Authenticated | Return current user's applications. |
| `/api/applications/create/` | POST | Corps Member | Apply to a program. Trainer and admin accounts are rejected. |
| `/api/manage/users/` | GET | Admin | List users. |
| `/api/manage/users/` | POST | Admin | Create a trainer account only. |
| `/api/manage/users/<id>/` | PATCH | Admin | Update user profile fields, role to corps member/trainer, or active status. |
| `/api/manage/programs/` | GET | Admin/Trainer | List all programs. |
| `/api/manage/programs/` | POST | Admin/Trainer | Create a program. |
| `/api/manage/programs/<id>/` | PATCH | Admin/Trainer | Update a program. |
| `/api/manage/applications/` | GET | Admin/Trainer | List all applications. |
| `/api/manage/applications/<id>/` | PATCH | Admin/Trainer | Approve, decline, or complete an application. |

## Application status rules

- Once an application's status is set to `completed` it is final and cannot be changed through the API or the Django admin UI. Attempts to change a completed application's status will return a validation error.
- The API endpoint `/api/manage/applications/<id>/` accepts `approved`, `declined`, and `completed` updates, but will reject updates when an application's current status is already `completed`.
- The Django admin UI treats completed applications as immutable: admin actions skip completed records and the `status` field is rendered readonly for completed applications.


## Access Rules

- Login accepts email and password only.
- Public signup creates corps member accounts only.
- Admin users can create trainer accounts.
- Admin users cannot create another admin account through the API.
- Admin users cannot deactivate their own account or change their own role through the API.
- Trainers and admins can manage programs and applications.
- Trainers and admins cannot apply to programs or submit applications.
- Trainers and admins can list all submitted student applications through `/api/manage/applications/`.
- Corps members can apply to programs and view their own applications.

## CSRF Notes

The frontend calls `/api/csrf/` to get a token and sends it as `X-CSRFToken` for write requests. Django rotates CSRF tokens around authentication changes, so the frontend clears cached CSRF values after login, signup, and logout, and retries once if Django returns a CSRF-specific `403`.

## Commands

Run these from SAED/backend unless stated otherwise.

Install Python dependencies:

```powershell
venv\Scripts\python.exe -m pip install -r requirements.txt
```

Run migrations:

```powershell
venv\Scripts\python.exe backend\manage.py migrate
```

Create migrations after model changes:

```powershell
venv\Scripts\python.exe backend\manage.py makemigrations
```

Seed demo data:

```powershell
venv\Scripts\python.exe backend\manage.py seed_saed
```

This command restores the demo admin and trainer accounts to active status, resets their passwords to `password123`, and restores their expected roles.

Run Django checks:

```powershell
venv\Scripts\python.exe backend\manage.py check
```

Run backend tests:

```powershell
venv\Scripts\python.exe backend\manage.py test saed
```

The backend test suite includes coverage for rejecting admin program applications and admin self-deactivation.

Start backend server:

```powershell
venv\Scripts\python.exe manage.py runserver 127.0.0.1:8002
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
cd backend
python manage.py seed_saed
```

Admin:

```text
Email: admin@saed.test
Password: password123
```

If the demo admin account cannot log in after user-management testing, rerun `seed_saed` to restore it.

Trainer:

```text
Email: trainer@saed.test
Password: password123
```

## Production Notes

- Set `DJANGO_DEBUG=false`.
- Set `DJANGO_SECRET_KEY`.
- Configure allowed hosts, CORS origins, and CSRF trusted origins.
- Use a production database instead of local SQLite.
- Run migrations before serving production traffic.
- Create admin accounts through trusted operational processes.
