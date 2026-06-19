# Change Log

## June 2026

### Bug Fixes

- **api.js FormData support**: `api()` now detects `FormData` instances and skips JSON serialization + Content-Type header, allowing file uploads (profile pictures, partnership letters) to work correctly.
- **TrainerSelection double JSON stringify**: Fixed `body: JSON.stringify({ trainerIds: selected })` → `body: { trainerIds: selected }` which was being double-stringified by the `api()` wrapper.
- **TrainerSignup wrong navigation**: After trainer signup, now navigates to `/trainer-signup-success` instead of `/app` where unauthorized trainers see the access-denied page.
- **MyTrainers price comparison**: Fixed `course.price === "0"` → `Number(course.price) === 0` to correctly show "Free" for zero-price courses regardless of string/number type.
- **ManageUsers.test button regex**: Fixed test searching for `/add user/i` → `/add trainer/i` to match actual button text.
- **Test login assertion**: Fixed test expecting role `"admin"` → `"saed_admin"` to match renamed role.
- **Test trainer dashboard**: Removed assertion checking for `applications` key in dashboard payload (not included in `program_payload`).
- **select_trainers profile null check**: Added guard for missing profile to prevent `RelatedObjectDoesNotExist` crash.
- **CSS z-index fix**: Changed `.modal-overlay` z-index from 100 → 200 so modals appear above the floating nav (z-index: 120).
- **CSS duplicate --nav-bg**: Removed duplicate `--nav-bg: #000` declaration in dark mode, keeping the semi-transparent value for backdrop blur.
- **Admin route protection**: Added `roles={["saed_admin", "dunis_admin"]}` to `/admin/dashboard` route.
- **404 route**: Added catch-all route showing "Page Not Found" message.

- **Role rename `admin` → `saed_admin`**: Full stack rename across models.py, views.py (9 locations), tests.py, seed_saed.py, and all frontend files. Migration 0014 includes data migration to update existing records.
- **MyTrainers double JSON stringify**: Fixed `body: JSON.stringify({ trainerId })` → `body: { trainerId }` which was being double-stringified by the `api()` wrapper.
- **MyTrainers typo**: Fixed `user?.lgaOfDeploment` → `user?.lgaOfDeployment`.
- **FindTrainers unused import**: Removed unused `STATES` import from `nigerianStates.js`.
- **Signup.jsx raw fetch**: Added `credentials: "include"` and proper Error object throwing instead of plain object.
- **EditProfile message-dismiss class**: Changed `className="message-dismiss"` → `className="inline-message-close"` to match CSS definition.
- **AppShell "Welcome, undefined"**: Added loading guard and null user check. Component now returns loading state while auth initializes.
- **AppShell handleLogout**: Added try/catch to prevent navigate from being skipped on logout failure.
- **auth.jsx unhandled rejection**: Added `.catch(() => {})` to initial `/auth/me/` session check.
- **api.js CSRF error handling**: Added try/catch in `ensureCsrf()` to prevent crashed mutating requests when CSRF endpoint is unreachable.
- **api.js lockedBase**: After first successful request, locks to that base to avoid re-iterating all 8 API_BASES on every call and losing session cookie context.
- **views.py program_list crash**: Added null check for `request.user.profile` to prevent `RelatedObjectDoesNotExist` crash.
- **views.py name split IndexError**: Fixed `full_name.split(" ", 1)[1]` to include `if " " in full_name else ""` guard.
- **views.py unguarded int()**: Added `_safe_int()` helper for `trainer_signup_view` and `manage_fast_track_videos` to prevent `ValueError` on non-numeric input.
- **views.py paystack auth**: Added `@api_login_required` to `paystack_initialize` endpoint to prevent anonymous payment reference creation.
- **views.py password reset**: Fixed potential `NameError` on `reset_payload` when user doesn't exist by initializing as empty dict.
- **styles.css inline-message base**: Separated `.form-error` and `.inline-message` base rules so `.inline-message` without a modifier no longer inherits error colors.

### New Features & Improvements

- **DunisAdmin page** (`/app/dunis-admin`): New admin interface for managing payments and fast track access. Shows all trainers and corps members with confirm payment, enable/disable fast track, and record management.
- **Complaint system**: Corps members can submit complaints to DUNIS admin via modal in AppShell. Complaints stored in new `Complaint` model.
- **Notification system**: In-app notifications for program restrictions, connection requests, connection approvals, and admin updates. Non-admin users do not see `admin_update` notifications.
- **Course management**: Trainers can create/edit/delete courses with auto-calculated dates (start, end, duration). Grid layout with fast track toggle.
- **Fast Track Videos**: Trainers can upload/manage video content for courses. Duration auto-fetch from YouTube/Vimeo URLs.
- **Trainer selection**: Corps members can select trainers during onboarding based on skill interest and LGA.
- **Connection system**: Corps members can connect with trainers. Notifications sent on request and approval.
- **Payment integration**: Paystack initialization and verification endpoints. Activation box with payment button for unauthorized trainers.
- **Activation box restructured**: Shows only when `!user?.hasPaid && !user?.paymentVerified`. Two-box layout with payment text and button.
- **Seed data improved**: Trainer is now authorized with `has_paid=True` and `payment_verified=True`. Added seeded corps member (`member@saed.test` / `password123`) for testing corps member flows.
- **BrowserRouter**: Switched from `HashRouter` to `BrowserRouter` for cleaner URLs.
- **Admin routes hidden**: Removed visible admin links from Login page. Admin routes kept undiscoverable.
- **Course date auto-calculation**: `_resolve_course_dates()` helper parses strings→dates and computes missing third value.
- **Sortable table columns**: `ManageUsers.jsx` client-side sorting on Name, Specialization, LGA, Status.
- **Notification clickability**: Both `AppShell.jsx` and `Dashboard.jsx` notification items clickable.
- **Back link for trainers**: "Back to Courses" link in course management.
- **Message system**: All pages now use typed messages (`messageType`: "success"/"error") with dismiss button and appropriate green/red styling.
- **CSS dark mode**: Added dark mode variants for `inline-message--success`, `inline-message--error`, `dunis-record-card`, `dunis-confirm-btn`, `dunis-toggle-btn`.
- **setupProxy.js**: Created `frontend/src/setupProxy.js` with `http-proxy-middleware` for proper session cookie forwarding. Uses `cookieDomainRewrite` and `onProxyRes` to strip `Domain=` from Set-Cookie headers. Removed conflicting `"proxy"` field from `package.json`.
- **Models expanded**: Added `updated_at`, `profile_picture`, `specialization`, `partner_lgas`, `years_experience`, `bio`, `company_name`, `number_trained`, `partnership_letter`, `is_verified`, `has_selected_trainers`, `can_upload_fast_track`, `is_busy_corper`, `payment_verified`, `payment_reference`, `payment_verified_at`, `authorization_status` to Profile. Added `is_restricted`, `restricted_at`, `restricted_by` to Program. Added `has_fast_track` to Course. Added `Notification` and `Complaint` models.
- **Trainer signup fixed**: Backend no longer requires `specialization`, `partnerLgas`, `partnershipLetter` at signup — all optional, completable via EditProfile.

### Documentation Updates

- Updated all role references from `admin` to `saed_admin` across README.md and backend/documentation.md.
- Added DUNIS Admin role description and access rules.
- Added new API endpoints table entries for courses, fast track, connections, notifications, complaints, and payments.
- Added model documentation for Course, FastTrackVideo, Connection, Notification, and Complaint.
- Added Profile field documentation for all new fields.
- Updated Program model documentation with `is_restricted`, `restricted_at`, `restricted_by` fields.
- Updated proxy description to reference `setupProxy.js`.
- Created this Changes.md file.
