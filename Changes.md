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
