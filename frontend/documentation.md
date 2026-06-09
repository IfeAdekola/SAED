# Frontend Documentation

## Overview

The frontend is a React application for NYSC SAED IMS. It provides public pages, authentication screens, program discovery, protected dashboards, corps member application tracking, staff student-application checking, program management, application review, and admin-only trainer account management.

## Frontend Stack

- React 19
- Create React App / `react-scripts`
- React Router with `HashRouter`
- Lucide React icons
- Plain CSS in `src/styles.css`

## File Structure

```text
frontend/
  public/
    activities/
      inter-platoon.jpg
      morning-meditation.jpg
      passing-out.jpg
      registration.jpg
      religion.jpg
      skills-acquisition.jpg
      social.jpg
      sports.jpg
      swearing-in.jpg
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
    data/
      activities.js
    lib/
      api.js
      auth.jsx
    pages/
      Activities.jsx
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
    index.js
    main.jsx
    styles.css
  .env
  documentation.md
  package.json
  package-lock.json
```

## Important Files

- `src/main.jsx`: App entry point, routes, protected route wrapper, and theme initialization.
- `src/lib/api.js`: Fetch wrapper for API requests. It prefers the same-origin `/api` proxy in development, clears cached CSRF tokens after auth changes, and retries once on CSRF-specific `403` responses.
- `src/lib/auth.jsx`: Auth context, session loading, login, signup, logout, and password reset helpers.
- `src/components/AppShell.jsx`: Authenticated app layout and navigation.
- `src/components/PasswordInput.jsx`: Reusable password input with an eye button for showing or hiding typed passwords.
- `src/pages/Login.jsx`: Shared login form for all account types. No admin sign-in selector is shown.
- `src/pages/Signup.jsx`: Corps member signup flow.
- `src/pages/ManageUsers.jsx`: Admin-only trainer account creation and user activation management.
- `src/pages/Applications.jsx`: Corps member application tracking; admin/trainer student application checking grouped by program.
- `src/pages/Programs.jsx`: Public and protected program browsing. Corps members can apply; admins/trainers view details.
- `src/pages/ProgramEditor.jsx`: Admin/trainer program management with a compact sticky desktop form.
- `src/pages/ManageApplications.jsx`: Admin/trainer application review.
- `src/styles.css`: Main styling for public pages, auth pages, dashboards, forms, tables, and responsive behavior.

The authenticated app navigation collapses into a hamburger menu on smaller screens. This prevents the sidebar links from overflowing horizontally.

Password fields on login, signup, password reset, and trainer creation use an eye button so users can check what they typed.

## Routes

The frontend uses `HashRouter`, so browser URLs use hash fragments such as `/#/app`.

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Home page. |
| `/activities` | Public | Camp activities page. |
| `/opportunities` | Public | Opportunities page. |
| `/forgot` | Public | Password reset page. |
| `/login` | Public | Email/password login for all roles. |
| `/signup` | Public | Corps member signup. |
| `/programs` | Public | Public program browsing. |
| `/app` | Authenticated | Dashboard. |
| `/app/programs` | Authenticated | Corps member application actions; admin/trainer program detail viewing. |
| `/app/applications` | Authenticated | Corps member application tracking; admin/trainer student application checking grouped by program. |
| `/app/manage-applications` | Admin/Trainer | Review applications. |
| `/app/program-editor` | Admin/Trainer | Create and edit programs. |
| `/app/users` | Admin | Create trainer accounts and manage access. |

## Auth Flow

1. The app calls `/api/auth/me/` on load to restore an existing Django session.
2. Login posts email and password to `/api/auth/login/`.
3. Signup creates corps member accounts only.
4. Admin users access `/app/users` from the sidebar after logging in normally.
5. The frontend hides the Users link unless the current user's role is `admin`.
6. Admin and trainer users do not submit applications from the frontend.
7. Protected pages redirect unauthenticated users to `/login`.

## Role-Based Screens

- Corps members see `Apply Now` on `/app/programs` and can submit applications.
- Admins and trainers see `View Details` on `/app/programs`; the details modal shows duration, capacity, available slots, trainer, location, and active status.
- Corps members use `/app/applications` to track their own applications.
- Admins and trainers use `/app/applications` as `Student Apps`, with applications sorted and grouped by program.
- Admins and trainers use `/app/manage-applications` to review student applications. The page includes filter buttons (All, Pending, Approved, Declined, Completed) for quick filtering; action buttons are disabled for applications already marked `completed` to enforce immutability. Relevant CSS classes: `.filter-row`, `.filter-buttons`, `.filter-buttons button.active`, and `.icon-action[disabled]`.
- Admins use `/app/users` to create trainers and manage access.
- The current admin's own deactivate action is disabled in `/app/users`.

## Program Editor Layout

`/app/program-editor` uses a fixed-height desktop panel. The program list can scroll, while the creation/edit form is compact and sticky so it fits inside the app viewport without internal form scrolling. On smaller screens, the layout becomes normal vertical flow.

## API Proxy

`package.json` contains:

```json
"proxy": "http://127.0.0.1:8002"
```

During local development, frontend requests to `/api/...` are proxied to the Django server.

The API wrapper clears cached CSRF tokens after login, signup, and logout because Django can rotate the CSRF token during authentication. If a write request receives a CSRF-specific `403`, it fetches a fresh token and retries once.

## Commands

Install dependencies:

```powershell
cd frontend
npm install
```

Start frontend dev server:

```powershell
cd frontend
npm start
```

Run frontend tests:

```powershell
cd frontend
npm test
```

Build production frontend:

```powershell
cd frontend
npm run build
```

Frontend URL:

```text
http://127.0.0.1:3001/
```

## Manual Testing Checklist

- Login page has no admin sign-in option.
- Admin can log in with email/password.
- Password fields can be shown and hidden with the eye button.
- Admin can create a trainer from `/app/users`.
- Admin cannot deactivate their own account from `/app/users`.
- Authenticated navigation is collapsible with a hamburger on small screens.
- Trainer cannot access `/app/users`.
- Admin/trainer sees `View Details` instead of `Apply Now` on `/app/programs`.
- Admin/trainer cannot submit program applications.
- Admin/trainer sees student applications grouped by program on `/app/applications`.
- Application review actions do not fail with stale CSRF after login.
- Program editor form fits in the desktop viewport without scrolling the form.
- Corps member can sign up from `/signup`.
- Corps member can browse programs and apply.
- User can view applications in `/app/applications`.
- Admin/trainer can review applications in `/app/manage-applications`.
- Admin/trainer can create and edit programs in `/app/program-editor`.

## Production Notes

- Build with `npm run build`.
- Serve the generated build with a production web server.
- Point API requests to the deployed backend.
- Confirm the backend CORS and CSRF settings include the deployed frontend origin.
- Keep frontend environment values out of source control when they contain deployment-specific secrets or private URLs.
