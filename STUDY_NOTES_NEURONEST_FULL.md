# NeuroNest Full Project Study Notes (Presentation + Viva)

## 1) Project Overview

### What NeuroNest is

NeuroNest is a full-stack healthcare management platform that connects **patients, doctors, and admins** in one digital system. It supports appointment booking, chat, teleconsultation, medical records, prescriptions, alerts, announcements, feedback, and governance controls.

### Problem it solves

Traditional healthcare workflows are fragmented across calls, paper records, and disconnected tools. NeuroNest solves this by providing:

- centralized patient-doctor communication,
- structured appointment lifecycle management,
- digital clinical data handling,
- realtime monitoring and alerts,
- admin oversight and quality governance.

### Users in the system

- **Patient**: registers, books appointments, chats with doctors, views records/prescriptions/alerts, gives feedback.
- **Doctor**: manages schedule, triages appointments, consults patients, writes prescriptions, monitors patient context.
- **Admin (and super admin-level flows)**: manages users, appointments, reports, announcements, settings, and governance escalations.

### Main modules

- Authentication (Login/Register)
- Role dashboards (Patient/Doctor/Admin)
- Appointment + Slot Management
- Doctor Scheduling and Overrides
- Chat + Realtime Messaging
- Video Consultation (WebRTC signaling)
- Medical Records + Prescriptions
- Vitals + Alerts + Assessment Reports
- Reviews/Feedback + Governance Escalation
- Announcement Management
- Settings and System Configuration

### Overall workflow (end-to-end)

1. User logs in and receives JWT token.
2. Frontend routes user to role-specific dashboard.
3. Patient discovers doctor and books slot-based appointment.
4. Doctor approves/rejects/reschedules and manages call state.
5. Patient and doctor communicate via chat and video consultation.
6. Doctor updates records/prescriptions.
7. Notifications and announcements are delivered in-app (and email where enabled).
8. Admin monitors quality, moderates reviews, and performs governance actions.

### System architecture summary

- **Frontend**: React SPA (Vite)
- **Backend**: Flask (Blueprint-based modular APIs)
- **Database**: SQLAlchemy models on PostgreSQL (SQLite fallback local)
- **Realtime**: Flask-SocketIO + Socket.IO client
- **Deployment**: Vercel (frontend), Render/Gunicorn (backend)

---

## 2) System Architecture

### Frontend technology used

- React 19
- React Router
- Axios + Fetch
- Bootstrap + custom CSS
- Socket.IO client
- Vite build system

### Backend technology used

- Flask 3
- Flask-JWT-Extended (auth)
- Flask-SQLAlchemy (ORM)
- Flask-SocketIO (realtime)
- APScheduler (periodic background jobs)

### Database used

- PostgreSQL in production (`DATABASE_URL`)
- SQLite fallback for local development

### Realtime communication

- Socket.IO rooms for:
  - chat conversations,
  - user-specific notifications,
  - vitals channels,
  - video signaling rooms.

### File storage

- Cloudinary for profile images and medical records.
- Local uploads folder used for chat file attachments (`uploads/chat`).

### Email/notification services

- In-app notifications persisted in DB (`in_app_notifications`)
- Email service chain in backend:
  - Resend

### Deployment platform

- Frontend: Vercel (`vercel.json` SPA rewrites)
- Backend: Render-style deployment with `gunicorn` (`backend/Procfile`)

### Architecture diagram explanation (text)

`React Client (Browser)`
-> calls -> `Flask REST APIs (Blueprints)`
-> uses -> `SQLAlchemy ORM`
-> reads/writes -> `PostgreSQL`

`React Socket Client`
<-> `Flask-SocketIO Server`
for chat, call signaling, vitals, notifications.

`Flask Backend`
-> uploads -> `Cloudinary`
-> sends -> `Email providers (Brevo/Resend/SMTP)`
-> optional SMS -> `Twilio`

---

## 3) Frontend (React) Analysis

## React Concepts Used

### Functional Components

Entire frontend is built with functional components.
Examples: `Login`, `Register`, `DoctorChat`, `VideoConsultation`, `AdminDashboard`, etc.

### Class Components

No class components found in `frontend/src`; all are functional.

### useState

Used heavily for UI state, forms, filters, loading flags, modal visibility, selected entities.

### useEffect

Used for:

- initial data loading,
- interval polling,
- socket event subscriptions,
- cleanup on unmount,
- reactive side effects on state changes.

### useContext

Used in global contexts:

- `CallContext`
- `AlertContext`
- `ThemeContext`
- `SystemConfigContext`
- `ModuleConfigContext`

### useRef

Used for persistent mutable references across renders:

- socket instances,
- peer connection/media refs,
- timers,
- optimistic message synchronization guards.

### Custom Hooks

Key custom hooks:

- `useLiveVitals`
- `useFeedback`
- `useDoctorFeedback`
- `usePatientFeedback`
- `useModuleConfig`
- `usePatientSettings`

### React Router

Role-based route trees:

- `/patient/*`
- `/doctor/*`
- `/admin/*`
  With route guards:
- `ProtectedRoute` (auth + role)

### Axios / Fetch

- Axios used for most structured API modules.
- Fetch used in vitals and some external requests.
- Auth token auto-attached via Axios interceptor.

### Form handling

Controlled forms across auth, booking, profile, settings, feedback.

### Conditional rendering

Used for role-specific UI, access denied/fallback screens, loading/errors, modals, feature toggles.

### Lifecycle methods (functional equivalent)

`useEffect` handles mount/update/unmount lifecycle logic.

### Props and state management

- Local state for page-level behavior.
- Props for reusable components (tables, modals, chat widgets).
- Context for shared cross-page state.

### Context API / Global state

Context powers app-wide states like active calls, notifications, themes, system settings, module config.

## Components Breakdown (Major)

### 1. Login

- **Purpose**: Authenticate user and route by role.
- **Main functions**: credential validation, login API, token/user persistence.
- **API called**: `POST /auth/login`
- **State**: `email`, `password`, `showPw`, `error`, `loading`
- **Props**: none
- **Flow**: submit -> token saved -> navigate to role dashboard/settings.
- **Type**: Functional

### 2. Register

- **Purpose**: Patient self-registration.
- **Main functions**: register account with password policy checks.
- **API called**: `POST /auth/register`
- **State**: form fields, password strength, mismatch flags, loading/error
- **Props**: none
- **Flow**: fill form -> validation -> register -> redirect login.
- **Type**: Functional

### 3. Dashboard (Role-based)

- **Purpose**: Role entry screen.
- **Main functions**: show stats, shortcuts, realtime indicators.
- **APIs**:
  - patient: vitals + appointments + notifications
  - doctor: stats + patients + schedule
  - admin: dashboard summary
- **State**: role-specific cards, loading, warnings
- **Type**: Functional

### 4. Admin Dashboard

- **Purpose**: overview of total users/appointments.
- **API**: `GET /api/admin/dashboard/`
- **State**: dashboard stats, load state
- **Type**: Functional

### 5. Doctor Dashboard

- **Purpose**: doctor daily operations panel.
- **APIs**: `/doctor/stats`, `/doctor/patients`, `/doctor/schedule`, call APIs
- **State**: profile, appointments, call-state summaries, live updates
- **Type**: Functional

### 6. Patient Dashboard

- **Purpose**: patient home with health and schedule insights.
- **APIs**: profile notifications/clinical summary + vitals endpoints + appointments
- **State**: vitals, trend series, upcoming appointments, alert badges
- **Type**: Functional

### 7. Appointment Booking

- **Purpose**: slot-based appointment creation.
- **APIs**:
  - `GET /appointments/doctors`
  - `GET /appointments/doctors/<id>/available-slots`
  - `POST /appointments/book-by-slot`
- **State**: doctor/date/slot/reason/priority/type/loading
- **Props**: booking callbacks in form components
- **Flow**: select doctor/date -> load slots -> choose slot -> submit.
- **Type**: Functional

### 8. Chat System

- **Purpose**: doctor-patient communication.
- **APIs**:
  - conversation/message CRUD endpoints under `/api/chat`
- **Socket events**: `new_message`, `receive_message`, `message_deleted`
- **State**: conversations, selected conversation, messages, unread counts
- **Props**: conversation list/chat window/header props
- **Flow**: select conversation -> join room -> fetch history -> send/receive.
- **Type**: Functional

### 9. Notifications

- **Purpose**: in-app user alerts.
- **APIs**: `/profile/notifications*`
- **Socket**: `new_in_app_notification`
- **State**: unread count, panel open/close, list state
- **Type**: Functional + Context-backed

### 10. Announcement Page

- **Purpose**: admin announcement lifecycle + user read/ack.
- **APIs**:
  - admin: `/api/admin/announcements/*`
  - user: `/api/announcements/*`
- **State**: filters, modal state, statuses, metrics
- **Type**: Functional

### 11. Reviews / Feedback

- **Purpose**: patient feedback submission and admin moderation.
- **APIs**: `/api/feedback/*`
- **State**: ratings, review text, moderation action note, analytics charts
- **Hooks**: `useFeedback`, `useDoctorFeedback`, `usePatientFeedback`
- **Type**: Functional

### 12. Settings

- **Purpose**: role-specific settings.
- **APIs**:
  - patient settings `/api/patient/settings/*`
  - doctor settings `/api/doctor/settings/*`
  - admin settings `/api/admin/settings*`, `/api/system-config`
- **State**: tab forms, save/export/loading states
- **Type**: Functional

### 13. Profile Management

- **Purpose**: maintain doctor/patient profile and metadata.
- **APIs**:
  - patient `/profile/me`
  - doctor `/api/doctor/profile/me`, image/availability/experience routes
- **State**: edit mode, form values, image upload state
- **Type**: Functional

### 14. Video Consultation

- **Purpose**: realtime teleconsultation via WebRTC.
- **APIs**:
  - call lifecycle `/api/calls/*`
  - ICE config `/api/rtc/ice-config`
  - appointment call join/leave state endpoints
- **Socket events**:
  - `join_video_room`
  - `webrtc_offer`
  - `webrtc_answer`
  - `ice_candidate`
  - `leave_video_room`
- **State/refs**: media tracks, connection state, mute/camera toggles
- **Type**: Functional

### 15. Governance / Admin Control Panel

- **Purpose**: escalation queue and doctor-risk actions.
- **APIs**: `/api/admin/governance/*` + `/api/feedback/*` moderation timeline/actions
- **State**: filtered escalations, action notes, detail payloads
- **Type**: Functional

### Class vs Functional summary

- **Class components**: none
- **Functional components**: all major pages/components

---

## 4) Backend (Flask) Analysis

## Flask Concepts Used

### Routes

Extensive role/domain-based REST routes for auth, appointments, doctor operations, admin management, feedback, chat, vitals, settings, governance.

### Blueprints

Examples:

- `auth_bp`
- `appointments_bp`
- `doctor_bp`
- `profile_bp`
- `patient_settings_bp`
- `doctor_settings_bp`
- `chat_bp`
- `feedback_bp`
- `admin_*` blueprints
- `rtc_bp`, `calls_bp`, `vitals_bp`

### Models

SQLAlchemy models define entities like users, profiles, appointments, slots, notifications, reviews, escalations, records, chat, vitals, prescriptions.

### Controllers / Services

Service layer encapsulates business logic:

- slot lifecycle and engine,
- governance,
- notifications,
- reports,
- appointment call-state handling.

### JWT Authentication

`flask_jwt_extended` with `@jwt_required()` and claims-based role checks.

### Middleware-like behavior

Not classic Flask middleware classes, but route wrappers/decorators and helper guards (`admin_required`, role validators).

### File uploads

- Profile images + records through Cloudinary helper.
- Chat uploads via local filesystem path.

### Email sending

Centralized in `NotificationService.send_email()` with provider fallback chain.

### Socket events

Registered for chat, video signaling, and vitals room membership.

### Database queries

Mix of ORM filters/joins, aggregated analytics, status transitions, and constraints.

### ORM (SQLAlchemy)

Flask-SQLAlchemy with enums, indexes, unique constraints, foreign keys, and model relationships.

### REST API design

Clear resource-driven prefixes and role segmentation:

- `/auth/*`
- `/appointments/*`
- `/doctor/*`
- `/api/admin/*`
- `/api/chat/*`
- `/api/feedback/*`
- `/api/patient/*`

## API List

| API                                             | Method                | Purpose                         | Used By                           |
| ----------------------------------------------- | --------------------- | ------------------------------- | --------------------------------- |
| `/auth/login`                                   | POST                  | User login + JWT                | Login page                        |
| `/auth/register`                                | POST                  | Patient registration            | Register page                     |
| `/appointments/doctors`                         | GET                   | List visible doctors            | Booking                           |
| `/appointments/doctors/<id>/available-slots`    | GET                   | Get free slots                  | Booking/Reschedule                |
| `/appointments/book-by-slot`                    | POST                  | Create appointment from slot    | Booking                           |
| `/appointments/`                                | GET                   | Patient appointment list        | Patient dashboard/My Appointments |
| `/appointments/<id>/cancel`                     | PUT                   | Cancel appointment              | Patient My Appointments           |
| `/appointments/<id>/reschedule`                 | PUT                   | Reschedule request              | Patient My Appointments           |
| `/doctor/appointment-requests`                  | GET                   | Doctor triage list              | Doctor AppointmentRequests        |
| `/doctor/appointments/<id>/approve`             | PATCH                 | Approve request                 | Doctor                            |
| `/doctor/appointments/<id>/reject`              | PATCH                 | Reject request                  | Doctor                            |
| `/doctor/appointments/<id>/reschedule`          | PATCH                 | Doctor reschedule               | Doctor                            |
| `/api/feedback/submit`                          | POST                  | Submit patient review           | Patient feedback                  |
| `/api/feedback/list`                            | GET                   | List reviews                    | Admin review management           |
| `/api/feedback/<id>/moderate`                   | POST                  | Moderate review                 | Admin governance                  |
| `/api/feedback/<id>/timeline`                   | GET                   | Moderation timeline             | Admin governance                  |
| `/api/announcements/`                           | GET                   | User announcements              | Patient/Doctor                    |
| `/api/announcements/<id>/read`                  | POST                  | Mark announcement read          | Patient/Doctor                    |
| `/api/announcements/<id>/acknowledge`           | POST                  | Acknowledge announcement        | Patient/Doctor                    |
| `/api/admin/announcements/`                     | GET/POST              | Admin list/create announcements | Admin                             |
| `/api/admin/announcements/<id>`                 | PUT/DELETE            | Update/delete announcement      | Admin                             |
| `/profile/notifications`                        | GET                   | In-app notifications            | All authenticated users           |
| `/profile/notifications/<id>/read`              | PATCH                 | Mark notification read          | Notification panel                |
| `/profile/notifications/read-all`               | PATCH                 | Mark all read                   | Notification panel                |
| `/api/chat/`                                    | GET/POST              | Conversations list/start        | Doctor/Patient chat               |
| `/api/chat/<id>/messages`                       | GET/POST              | Get/send messages               | Chat window                       |
| `/api/chat/messages/<id>`                       | DELETE                | Delete message                  | Chat window                       |
| `/api/chat/<id>/read`                           | PATCH                 | Mark conversation read          | Chat window                       |
| `/api/admin/patients/*`                         | GET/PATCH             | Patient management              | Admin panel                       |
| `/api/admin/doctors/*`                          | GET/POST/PATCH/DELETE | Doctor management               | Admin panel                       |
| `/api/admin/appointments/*`                     | GET/PATCH             | Appointment oversight           | Admin panel                       |
| `/api/doctor/settings/*`                        | GET/PUT/POST          | Doctor settings update          | Doctor settings page              |
| `/api/patient/medical-records*`                 | GET/POST/PUT/DELETE   | Patient medical records         | Patient/Doctor records pages      |
| `/api/patient/allergies*`                       | GET/POST/PUT/DELETE   | Allergy data                    | Patient/Doctor records pages      |
| `/api/patient/conditions*`                      | GET/POST/PUT/DELETE   | Conditions data                 | Patient/Doctor records pages      |
| `/api/patient/medications*`                     | GET/POST/PUT/DELETE   | Medications data                | Patient/Doctor records pages      |
| `/api/admin/governance/escalations`             | GET                   | Escalation queue                | Admin governance                  |
| `/api/admin/governance/escalations/<id>/action` | POST                  | Governance action               | Admin governance                  |
| `/api/admin/governance/escalations/<id>/close`  | POST                  | Close escalation                | Super-admin workflows             |
| `/api/admin/governance/doctor/<id>/governance`  | GET                   | Doctor governance profile       | Admin governance detail           |

---

## 5) Database Design

### List of major tables

- `users`
- `patient_profiles`
- `doctor_profiles`
- `appointments`
- `appointment_slots`
- `doctor_schedule_settings`
- `doctor_slot_overrides`
- `slot_event_logs`
- `conversations`
- `participants`
- `messages`
- `prescriptions`
- `prescription_items`
- `medical_records`
- `record_tags`
- `patient_allergies`
- `patient_conditions`
- `patient_medications`
- `in_app_notifications`
- `announcements`
- `announcement_targets`
- `announcement_reads`
- `reviews`
- `review_tags`
- `review_moderation_logs`
- `review_escalations`
- `doctor_escalations`
- `escalation_actions`
- `alerts`
- `medical_devices`
- `vital_stream_records`
- `latest_vital_states`
- `system_settings`
- `security_activity`
- audit/status tables (`doctor_audit_logs`, `patient_audit_logs`, etc.)

### Primary keys

Most tables use integer `id` as primary key.

### Foreign keys (examples)

- `appointments.patient_id -> users.id`
- `appointments.doctor_id -> users.id`
- `appointments.slot_id -> appointment_slots.id`
- `patient_profiles.user_id -> users.id`
- `doctor_profiles.user_id -> users.id`
- `messages.conversation_id -> conversations.id`
- `participants.user_id -> users.id`
- `prescriptions.doctor_id/patient_id -> users.id`
- `announcement_reads.announcement_id -> announcements.id`
- `announcement_reads.user_id -> users.id`
- `reviews.appointment_id -> appointments.id`

### Relationships

- User 1:1 PatientProfile
- User 1:1 DoctorProfile
- User 1:N Appointments (as patient)
- User 1:N Appointments (as doctor)
- Appointment N:1 AppointmentSlot (optional)
- Conversation 1:N Message
- Conversation 1:N Participant
- Prescription 1:N PrescriptionItem
- Announcement 1:N AnnouncementTarget
- Announcement 1:N AnnouncementRead
- Review 1:N ModerationLogs
- DoctorEscalation 1:N EscalationActions

### One-to-many relationships

- User -> Notifications
- User -> SecurityActivity
- Patient -> MedicalRecords
- Doctor -> AppointmentSlots
- Conversation -> Messages

### Many-to-many relationships

- Users <-> Conversations via `participants`
- Announcements <-> Users via targeting + `announcement_reads`

### Important tables requested and how they map

- `users`: exists directly
- `appointments`: exists directly
- `appointment_slots`: exists directly
- `announcements`: exists directly
- `announcement_reads`: exists directly
- `reviews`: exists directly
- `notifications`: implemented as `in_app_notifications`
- `messages`: exists directly
- `clinical_records`: implemented via `medical_records` + `clinical_remarks`
- `governance_cases`: implemented via `doctor_escalations` + `review_escalations`

### ER diagram explanation (text)

`users` is central identity.

- If role is patient, detailed profile exists in `patient_profiles`.
- If role is doctor, profile and schedule/telemetry exist in `doctor_profiles` and schedule tables.

`appointments` connect one patient user and one doctor user, optionally linked to `appointment_slots`.
`reviews` and `prescriptions` are tied to appointments and doctor/patient users.
`medical_records` and related health-history tables belong to patients.

`conversations` connect users through `participants`; `messages` belong to conversations.
`announcements` are created by admin and targeted to many users, with read/ack tracking.
`governance` tables track escalations and administrative actions.

---

## 6) Realtime System

### How Socket.IO is used

Socket.IO is integrated in backend and frontend for low-latency events.

### Chat system flow

1. Client connects socket with JWT token.
2. Backend validates token and joins `user_<id>` room.
3. Client joins `conversation_<id>` rooms.
4. On send message:
   - message stored in DB,
   - emitted to conversation room and user rooms,
   - in-app notification optionally sent.

### Notification flow

1. Backend writes `in_app_notifications` row.
2. Emits `new_in_app_notification` to `user_<id>` room.
3. Frontend updates panel/badges without reload.

### Live updates

- New messages in chat
- Call state transitions
- Vitals updates and critical alerts
- New announcement/notification pushes

### Emit and receive patterns

- Server emits to room/user channels.
- Client listeners update state and UI.
- Fallback polling exists in chat for resilience.

### Rooms/channels

- `user_<id>`
- `conversation_<id>`
- `patient_vitals_<patient_id>`
- dynamic video rooms for WebRTC signaling

### Online/offline users

- Connect/disconnect events logged.
- No dedicated persistent online-users table; availability inferred from socket session and event flow.

---

## 7) External Services / APIs Used

### Email service

- Brevo API (primary email provider)
- Resend (fallback)
- SMTP (fallback)
- Purpose: appointment updates, warnings, suspension notices, alerts.

### File storage

- Cloudinary for profile images and medical record files.
- Purpose: cloud-hosted secure file URLs and media management.

### Deployment platform

- Frontend: Vercel
- Backend: Render/Gunicorn

### Socket.IO

- Realtime transport layer between browser and backend for chat/calls/vitals/notifications.

### Render / Vercel / Netlify

- Actual code config indicates Vercel + Render.
- Netlify is not configured in this codebase.

### Database hosting

- PostgreSQL via `DATABASE_URL` in production.

### Video call service

- Browser-native WebRTC
- STUN servers (Google + Twilio STUN endpoint) via `/api/rtc/ice-config`
- TURN optional via env variables

### Other third-party APIs/libraries

- Twilio SDK (optional SMS + STUN reference)
- ReportLab (PDF generation for assessment reports)

---

## 8) Deployment (Step-by-step)

### Frontend deployment

1. Install frontend deps.
2. Build using Vite (`npm --prefix frontend run build`).
3. Deploy dist output (`frontend/dist`) to Vercel.
4. Configure SPA rewrite to `index.html`.
5. Set `VITE_API_BASE_URL` pointing to backend.

### Backend deployment

1. Install backend Python dependencies (`requirements.txt`).
2. Set env vars (`DATABASE_URL`, keys, CORS, cloud/email configs).
3. Start using Procfile command:
   - `gunicorn -w 1 --threads 4 "app:create_app()"`
4. Ensure socket and scheduler start correctly.

### Database hosting

- Use managed PostgreSQL URL in `DATABASE_URL`.

### Environment variables (important)

- Security: `SECRET_KEY`, `JWT_SECRET_KEY`
- DB: `DATABASE_URL`
- CORS: `CORS_ORIGINS`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Email: `BREVO_API_KEY` / `RESEND_API_KEY` / SMTP vars
- RTC optional TURN vars: `TURN_URLS`, `TURN_USERNAME`, `TURN_CREDENTIAL`

### Production vs development

- Development: local Vite + local Flask/SQLite possible.
- Production: Vercel + Render + PostgreSQL + cloud integrations.

### Build process

- Frontend compiled bundle (Vite).
- Backend interpreted Python service (Gunicorn workers).

### Domain and hosting

- Frontend domain expected on Vercel.
- Backend domain expected on Render.
- Frontend API config resolves backend base URL from env or fallback.

---

## 9) Features List (Very Important)

## Admin Features

- Admin dashboard metrics
- Manage doctors (create/verify/status/delete)
- Manage patients (list/detail/status)
- Manage appointments by sector/department/doctor
- Reports (overview, appointment analytics, doctor performance, governance)
- Announcement creation and lifecycle management
- Review moderation and restoration
- Governance escalation queue and actions
- System settings + system config updates

## Doctor Features

- Dashboard with patient and schedule insights
- Appointment triage (approve/reject/reschedule)
- Schedule slot generation, block/unblock, overrides
- Appointment lifecycle updates (complete/cancel/no-show/extend)
- Patient roster and dossier access
- Clinical remarks and pins
- Doctor profile management (image, expertise, experience, availability)
- Doctor settings (account/notification/privacy/consultation)
- Chat with patients
- Video consultation join/leave
- Prescription creation and management
- Alerts monitoring and assessment report access

## Patient Features

- Self registration and login
- Profile and emergency contact management
- Browse doctors and public doctor profiles
- Slot-based booking, cancel, reschedule, confirm
- View upcoming/past appointments
- Chat with doctor
- Join online consultations
- Medical records upload/view/download/delete
- Manage allergies, conditions, medications
- View prescriptions
- Vitals monitoring and PDF assessment reports
- Receive/mark notifications and announcements
- Submit feedback/reviews and complaints
- Patient settings (privacy/security/notifications/data export/delete account)

## System Features

- Role-based routing and access control
- Module registry with feature toggles
- Realtime websocket channels
- Background scheduler for consultation checks
- Structured audit and governance logging

## Security Features

- JWT auth
- Route-level role checks
- Suspension enforcement for doctor login
- Security activity logs
- Read/acknowledgement tracking
- Room-level access checks for sensitive realtime channels

## Realtime Features

- Realtime chat delivery
- Realtime call signaling lifecycle
- Realtime vitals updates
- Realtime critical alert push
- Realtime notification push

---

## 10) Computer Science Concepts Used

### CRUD operations

Implemented throughout appointments, records, users, messages, feedback, announcements, settings.

### Authentication & Authorization

JWT authentication and strict role-based endpoint restrictions.

### Role-Based Access Control (RBAC)

Patient/Doctor/Admin/Super-admin access boundaries enforced in frontend and backend.

### Database normalization

Identity is centralized in `users`; role-specific details split into profile/settings tables.

### REST APIs

Resource-based endpoints with HTTP verbs and role-specific route grouping.

### Client-Server architecture

React client consumes Flask APIs over HTTP and Socket.IO.

### WebSockets / Socket.IO

Bidirectional realtime events for chat/calls/vitals/notifications.

### Real-time systems

Near-live clinical communication and vital alerting.

### Distributed systems concepts

- eventual consistency between socket updates and persisted state,
- fallback polling for transient connectivity issues,
- multi-channel notification delivery.

### Lamport timestamps

Not implemented explicitly. Ordering is timestamp-based (`created_at` and time sorting), not logical clock-based.

### Caching

- In-memory latest vitals/history buffers in backend.
- `latest_vital_states` table acts as persistent “latest state” cache model.

### State management

- Local component state (`useState`)
- Global context (`useContext`) for cross-module state.

### MVC architecture

Not strict classical MVC, but close layering:

- Models (SQLAlchemy)
- Route/controller endpoints
- Service layer business logic.

---

## 11) Presentation Explanation Section

### How to explain project in presentation

Start with problem and users:

- “Hospitals need one integrated platform for appointments, communication, records, and governance.”
  Then explain NeuroNest as the unified solution.

### System workflow explanation

Show one patient journey:

1. Login
2. Book appointment
3. Doctor triage
4. Chat/video consultation
5. Prescription/records update
6. Feedback
7. Admin oversight and quality governance

### Architecture explanation

- React frontend for role-based UI
- Flask backend with modular blueprints
- PostgreSQL relational model
- Socket.IO realtime layer
- Cloud integrations for files and notifications

### Database explanation

Explain central `users` table, role profiles, appointment-centric design, governance/audit tables, and communication subsystem tables.

### Technologies used explanation

- React for modular responsive UI
- Flask for lightweight, scalable API modules
- SQLAlchemy for schema integrity and relation mapping
- Socket.IO for realtime clinical UX

### Challenges faced

- Appointment race conditions and slot consistency
- Realtime reliability in chat/video across unstable networks
- Cross-role permission complexity
- Multi-environment schema compatibility and migrations

### Future improvements

- formal migrations with Alembic
- stronger realtime presence tracking
- queue-based notification service
- richer observability and health dashboards
- advanced governance analytics and ML-based triage

---

## 12) Viva / Interview Questions with Answers

1. **Q: What is NeuroNest in one line?**  
   **A:** A role-based full-stack healthcare platform for appointments, communication, records, alerts, and governance.

2. **Q: Which stack is used?**  
   **A:** React + Vite frontend, Flask + SQLAlchemy backend, PostgreSQL database, Socket.IO realtime.

3. **Q: How is authentication implemented?**  
   **A:** JWT token generated at login and sent in Authorization header.

4. **Q: How does role-based access work?**  
   **A:** Frontend route guards + backend role checks in protected endpoints.

5. **Q: Why separate patient and doctor profiles from users table?**  
   **A:** To normalize role-specific attributes and keep identity model clean.

6. **Q: How does slot booking avoid conflicts?**  
   **A:** Slot locking, schedule setting lock, and status checks before booking.

7. **Q: Why both REST and Socket.IO for chat?**  
   **A:** REST ensures persistence/retrieval; Socket.IO ensures realtime delivery.

8. **Q: How are notifications delivered?**  
   **A:** Stored in DB and pushed via socket to user room; optional email channels respect preferences.

9. **Q: How is video consultation implemented?**  
   **A:** WebRTC peer connection with Flask-SocketIO signaling and ICE configuration endpoint.

10. **Q: Which table stores in-app notifications?**  
    **A:** `in_app_notifications`.

11. **Q: How is governance handled?**  
    **A:** Review moderation and escalation workflows with action logs and doctor escalation management.

12. **Q: Where are files stored?**  
    **A:** Cloudinary for records/images; chat attachments can use local uploads.

13. **Q: How are critical vitals processed?**  
    **A:** Threshold checks trigger alert record creation + socket emit + notification service.

14. **Q: What deployment strategy is used?**  
    **A:** Vercel for frontend and Render/Gunicorn for backend with env-based configuration.

15. **Q: Are Lamport timestamps used?**  
    **A:** No, ordering relies on real timestamps from DB/events.

16. **Q: Why use contexts in frontend?**  
    **A:** To share global app state (calls, alerts, theme, configs) across pages.

17. **Q: How do announcements target audiences?**  
    **A:** By role/user/audience targeting logic and per-user read/ack tracking.

18. **Q: What key security controls exist?**  
    **A:** JWT auth, RBAC, account status checks, audit logs, room access checks.

19. **Q: What is one major scalability challenge?**  
    **A:** Managing realtime session consistency and notification throughput at scale.

20. **Q: What is your top future enhancement?**  
    **A:** Introduce robust migration/versioning + queue-driven notifications + deeper observability.

---

## 13) Final One-Day Revision Summary

NeuroNest is a complete digital healthcare platform connecting patients, doctors, and admins. It uses a React frontend and Flask backend with PostgreSQL. Patients can register, book appointments, maintain records, receive alerts, chat, and attend video consultations. Doctors manage appointments, schedules, patient context, and prescriptions. Admins manage all users, appointments, announcements, settings, reports, and governance escalations.

Technically, the project combines REST APIs and Socket.IO realtime channels. Data is modeled with SQLAlchemy using clear role separation and rich relational links. Cloudinary handles file storage, while email providers deliver external notifications. Deployment is structured around Vercel (frontend) and Render/Gunicorn (backend).

For presentation/viva, remember this flow:
**Auth -> Role Dashboard -> Appointment Lifecycle -> Chat/Call -> Records/Prescription -> Notifications/Feedback -> Admin Governance**.

This is the core story that demonstrates both practical healthcare impact and strong full-stack engineering design.

---

## 14) Render Environment Variables Master Guide (Detailed)

This section explains **each environment variable used in the codebase**, exactly how it behaves on Render, and what value to set.

## A) Backend Runtime and Security Variables

### 1. `DATABASE_URL`

- **Where used**: `backend/config/config.py`
- **Purpose**: SQLAlchemy database connection URI.
- **If missing**: falls back to local SQLite (`backend/neuronest.db`).
- **Render value**: Render PostgreSQL internal URL (from Render DB service).
- **Required in production**: Yes.
- **Example**:
  - `postgresql://user:password@host:5432/neuronest`

### 2. `SECRET_KEY`

- **Where used**: `backend/config/config.py`
- **Purpose**: Flask app secret + fallback for JWT secret.
- **If missing**: insecure hardcoded fallback is used.
- **Render value**: long random secret string.
- **Required in production**: Yes (critical).

### 3. `JWT_SECRET_KEY`

- **Where used**: `backend/config/config.py`
- **Purpose**: signing JWT access tokens.
- **If missing**: falls back to `SECRET_KEY`.
- **Render value**: long random string (can be same as `SECRET_KEY`, but better separate).
- **Required in production**: Strongly yes.

### 4. `CORS_ORIGINS`

- **Where used**: `backend/app.py`
- **Purpose**: allowed frontend origins for CORS.
- **Format**: comma-separated URLs.
- **Render value example**:
  - `https://your-frontend.vercel.app,https://your-custom-domain.com`
- **Notes**:
  - Code also allows `*.vercel.app` via regex.
  - Keep strict in production.

### 5. `PORT`

- **Where used**: `backend/app.py` in `socketio.run(...)` for direct run mode.
- **Render behavior**: Render injects `PORT` automatically.
- **Required to set manually**: usually No.

---

## B) Cloudinary (File Storage)

### 6. `CLOUDINARY_CLOUD_NAME`

### 7. `CLOUDINARY_API_KEY`

### 8. `CLOUDINARY_API_SECRET`

- **Where used**: `backend/utils/cloudinary_upload.py`
- **Purpose**: upload profile images + medical records.
- **If missing**: upload APIs fail where Cloudinary is required.
- **Required in production**: Yes (if using cloud uploads).

---

## C) Email Delivery Variables

Notification service has a fallback chain:

1. Brevo
2. Resend
3. SMTP

### 9. `BREVO_API_KEY`

- **Where used**: `backend/services/notification_service.py`
- **Purpose**: primary email provider key.
- **Recommended**: set this for stable production email.

### 10. `BREVO_FROM_EMAIL`

- **Where used**: same file.
- **Purpose**: sender email for Brevo.
- **Default**: `neuronest4@gmail.com`.
- **Recommended**: use verified domain sender.

### 11. `RESEND_API_KEY`

- **Where used**: auth debug route + notification fallback.
- **Purpose**: email fallback provider.

### 12. `RESEND_FROM`

- **Where used**: notification service.
- **Default**: `onboarding@resend.dev`.
- **Note**: use verified domain sender for production deliverability.

### 13. `TEST_EMAIL_OVERRIDE`

- **Where used**: notification service.
- **Purpose**: force all outgoing emails to one inbox (testing/demo).
- **Production**: should be unset.

### 14. `SMTP_HOST`

### 15. `SMTP_PORT`

### 16. `SMTP_PASS`

### 17. `smtp_user` (lowercase)

- **Where used**: notification service SMTP fallback.
- **Important gotcha**:
  - code expects lowercase `smtp_user` (not `SMTP_USER`).
- **Production recommendation**:
  - Prefer Brevo/Resend.
  - Keep SMTP only as emergency fallback.

---

## D) Twilio and RTC Variables

### 18. `TWILIO_SID`

### 19. `TWILIO_AUTH`

### 20. `TWILIO_FROM_PHONE`

- **Where used**: `NotificationService.send_sms()`.
- **Purpose**: SMS alert channel (optional).
- **Required**: only if SMS is needed.

### 21. `TURN_URLS`

### 22. `TURN_USERNAME`

### 23. `TURN_CREDENTIAL`

- **Where used**: `backend/routes/rtc.py`
- **Purpose**: TURN relay config for WebRTC on restrictive networks.
- **If missing**: app still works with STUN only, but call reliability can drop across NAT/firewalls.
- **Recommended in production**: Yes.

---

## E) App URL / Admin Provisioning Variables

### 24. `FRONTEND_URL`

- **Where used**: `backend/routes/admin/manage_doctors_routes.py`
- **Purpose**: generates login link in doctor onboarding email.
- **Default**: `https://neuro-nest-two.vercel.app`
- **Set on Render**: your actual frontend domain.

---

## F) Dev/Debug/Bootstrap Variables

### 25. `ALLOW_DEV_DOCTOR_BOOTSTRAP`

### 26. `DEFAULT_DOCTOR_EMAIL`

### 27. `DEFAULT_DOCTOR_PASSWORD`

- **Where used**: `backend/routes/auth.py`
- **Purpose**: optional auto-create default doctor in dev.
- **Production**: keep disabled (`false`) and do not expose dev password logic.

### 28. `RENDER_GIT_COMMIT`

### 29. `GIT_COMMIT`

- **Where used**: feedback marker endpoint.
- **Purpose**: debugging build identity.
- **Set manually**: usually not needed (Render may inject build metadata differently).

---

## G) Frontend Variables (Vercel / local `.env`)

### 30. `VITE_API_BASE_URL`

### 31. `VITE_API_URL`

- **Where used**: `frontend/src/config/env.js`
- **Purpose**: backend base URL in frontend.
- **Fallback**: hardcoded Render backend URL.
- **Production recommendation**: set `VITE_API_BASE_URL` explicitly in Vercel.

---

## H) `.env.example` vs actual code mapping (Important mismatch notes)

### Mismatch 1: JWT variable naming

- `.env.example` contains `JWT_SECRET`
- code reads `JWT_SECRET_KEY`
- **Action**: set `JWT_SECRET_KEY` in Render (not only `JWT_SECRET`).

### Mismatch 2: SMTP user case

- many teams use `SMTP_USER`
- code reads lowercase `smtp_user`
- **Action**: if using SMTP fallback, define `smtp_user` exactly.

### Mismatch 3: Flask env var

- `.env.example` includes `FLASK_ENV`
- code does not rely on it directly for core config.
- **Action**: optional.

---

## I) Render Setup Checklist (Recommended)

1. Create PostgreSQL service in Render.
2. Add backend web service env vars:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `JWT_SECRET_KEY`
   - `CORS_ORIGINS`
   - `FRONTEND_URL`
   - Cloudinary vars (`CLOUDINARY_*`)
   - email provider vars (`BREVO_*` or `RESEND_*`)
   - TURN vars if using reliable WebRTC
3. Keep dev bootstrap vars disabled in production:
   - `ALLOW_DEV_DOCTOR_BOOTSTRAP=false`
4. Do not set `TEST_EMAIL_OVERRIDE` in production.
5. Verify backend health at `/` and auth route responses.
6. Set frontend Vercel env:
   - `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com`
7. Redeploy backend and frontend.

---

## J) Environment Variable Security Best Practices

- Never commit real secrets in Git.
- Rotate secrets periodically.
- Use separate secrets for dev/staging/prod.
- Restrict CORS to known domains.
- Use verified sender domains for email providers.
- Monitor Render logs for fallback warnings like:
  - "No RESEND_API_KEY and no SMTP config"
  - Cloudinary missing credentials

---

## K) Quick Reference Table (At-a-glance)

| Variable                     | Required Prod      | Service              | Default/Fallback            | Notes                               |
| ---------------------------- | ------------------ | -------------------- | --------------------------- | ----------------------------------- |
| `DATABASE_URL`               | Yes                | DB                   | SQLite local fallback       | Must point to Postgres on Render    |
| `SECRET_KEY`                 | Yes                | Flask security       | Hardcoded fallback (unsafe) | Set strong random value             |
| `JWT_SECRET_KEY`             | Yes                | JWT                  | falls back to `SECRET_KEY`  | Prefer dedicated secret             |
| `CORS_ORIGINS`               | Yes                | CORS                 | localhost list              | Set Vercel/custom domains           |
| `CLOUDINARY_CLOUD_NAME`      | Yes\*              | File storage         | none                        | \*Required if cloud uploads enabled |
| `CLOUDINARY_API_KEY`         | Yes\*              | File storage         | none                        | same                                |
| `CLOUDINARY_API_SECRET`      | Yes\*              | File storage         | none                        | same                                |
| `BREVO_API_KEY`              | Recommended        | Email                | none                        | Primary email path                  |
| `BREVO_FROM_EMAIL`           | Recommended        | Email                | `neuronest4@gmail.com`      | Use verified sender                 |
| `RESEND_API_KEY`             | Optional fallback  | Email                | none                        | Backup path                         |
| `RESEND_FROM`                | Optional fallback  | Email                | `onboarding@resend.dev`     | Verified domain preferred           |
| `SMTP_HOST`                  | Optional fallback  | Email                | none                        | Only if SMTP fallback used          |
| `SMTP_PORT`                  | Optional fallback  | Email                | `587`                       |                                     |
| `SMTP_PASS`                  | Optional fallback  | Email                | none                        |                                     |
| `smtp_user`                  | Optional fallback  | Email                | none                        | lowercase key expected              |
| `TEST_EMAIL_OVERRIDE`        | No                 | Email test           | none                        | keep unset in prod                  |
| `TWILIO_SID`                 | Optional           | SMS                  | none                        | if SMS needed                       |
| `TWILIO_AUTH`                | Optional           | SMS                  | none                        |                                     |
| `TWILIO_FROM_PHONE`          | Optional           | SMS                  | none                        |                                     |
| `TURN_URLS`                  | Recommended        | WebRTC               | STUN-only mode              | improves call reliability           |
| `TURN_USERNAME`              | Recommended        | WebRTC               | none                        | with TURN                           |
| `TURN_CREDENTIAL`            | Recommended        | WebRTC               | none                        | with TURN                           |
| `FRONTEND_URL`               | Recommended        | Email links          | Vercel fallback URL         | onboarding links                    |
| `ALLOW_DEV_DOCTOR_BOOTSTRAP` | No                 | Dev helper           | `false`                     | keep false in prod                  |
| `DEFAULT_DOCTOR_EMAIL`       | No                 | Dev helper           | preset dev email            | only with bootstrap                 |
| `DEFAULT_DOCTOR_PASSWORD`    | No                 | Dev helper           | `123456`                    | insecure, dev only                  |
| `VITE_API_BASE_URL`          | Yes (frontend)     | Frontend API routing | hardcoded backend fallback  | set in Vercel                       |
| `VITE_API_URL`               | Optional alternate | Frontend API routing | none                        | backup frontend var                 |

---

## 15) Algorithms Used in NeuroNest (Viva-Focused)

This project mostly uses **applied system algorithms and design patterns** rather than classical competitive-programming algorithms. These are still core CS-relevant.

## A) Slot Conflict Prevention Algorithm

- **Problem solved**: prevent double booking for the same doctor/time.
- **Approach**:
  - lock doctor schedule context,
  - lock target slot row,
  - validate slot status (`available`),
  - perform conflict query for overlapping/duplicate appointment timing,
  - commit status transition atomically.
- **CS concepts**: concurrency control, critical sections, transactional integrity.
- **Code areas**: `backend/routes/appointments.py`, `backend/services/slot_lifecycle_service.py`, `backend/utils/slot_engine.py`.

## B) Rolling Window Slot Generation

- **Problem solved**: continuously maintain future appointment inventory.
- **Approach**:
  - define rolling bounds (start/end date),
  - generate slots per doctor availability and policy,
  - refresh/clean stale holds,
  - expose generated slots to patient booking flow.
- **CS concepts**: windowed scheduling, deterministic generation, temporal indexing.
- **Code areas**: `backend/utils/slot_engine.py`, `backend/routes/doctor.py`, `backend/routes/appointments.py`.

## C) Interval Overlap Detection

- **Problem solved**: avoid conflicting availability and override ranges.
- **Approach**: standard overlap predicate  
  `A.start < B.end && A.end > B.start`
- **CS concepts**: interval algebra, constraint validation.
- **Code areas**: `backend/routes/doctor_profile.py`, schedule override flows in doctor routes.

## D) Appointment/Call State Transition Algorithm

- **Problem solved**: derive correct consultation state from time and participation.
- **Approach**:
  - compute join windows,
  - evaluate patient/doctor joined flags,
  - transition call states (`scheduled -> waiting -> ongoing -> completed/missed`),
  - enforce transition by sync function.
- **CS concepts**: finite-state machine (FSM), time-driven transitions.
- **Code areas**: `backend/services/appointment_call_service.py`, model call-state helpers in `backend/database/models.py`, join/leave endpoints in appointment and doctor routes.

## E) Threshold-Based Alert Detection with Cooldown

- **Problem solved**: trigger critical alerts from vitals without alert spam.
- **Approach**:
  - evaluate HR/SpO2/temperature thresholds,
  - maintain last-alert timestamp per `(patient, vital_type)`,
  - suppress repeated alerts during cooldown window.
- **CS concepts**: rule-based anomaly detection, rate limiting, temporal filtering.
- **Code areas**: `backend/routes/vitals_route.py`.

## F) Realtime Message Reconciliation Algorithm

- **Problem solved**: maintain chat consistency under network jitter.
- **Approach**:
  - optimistic UI message insertion,
  - server-authoritative persistence,
  - socket event update/replace logic,
  - fallback polling reconciliation.
- **CS concepts**: eventual consistency, conflict reconciliation, client-side convergence.
- **Code areas**: `frontend/src/pages/doctor/DoctorChat.jsx`, `frontend/src/pages/patient/Chat.jsx`, `backend/modules/chat/socket_events.py`, `backend/modules/chat/routes.py`.

## G) Audience Resolution Algorithm for Announcements

- **Problem solved**: convert abstract targets into concrete recipient set.
- **Approach**:
  - normalize target definitions (`All`, `Role`, `User`, `Audience`),
  - resolve each target to user IDs,
  - union into final deduplicated recipient list.
- **CS concepts**: set operations, rule-based expansion, broadcast targeting.
- **Code areas**: `backend/routes/admin/announcement_routes.py`.

## H) Moderation and Governance Decision Rules

- **Problem solved**: deterministic handling of review moderation actions.
- **Approach**:
  - map action (`approve/flag/hide/suspend`) to status transitions,
  - update visibility/flag fields and optional doctor account state,
  - append moderation/escalation logs.
- **CS concepts**: policy engine, rule evaluation, auditable state transition.
- **Code areas**: `backend/modules/feedback/service.py`, `backend/routes/admin/governance_routes.py`.

## I) Scheduler-Based Periodic Evaluation

- **Problem solved**: run periodic checks (upcoming consultations/reminders).
- **Approach**:
  - fixed-interval background scheduler job,
  - evaluate near-term appointment conditions repeatedly.
- **CS concepts**: periodic task scheduling, background job orchestration.
- **Code areas**: `backend/app.py`, `backend/services/scheduler_service.py`.

---

## 16) Implemented Features (Developer Language)

Use this section in slides/report when evaluator asks: “What exactly did you implement?”

## A) CRUD Features Implemented

- **Users/Auth**: registration and login with JWT issuance.
- **Appointments**: create/list/update lifecycle (cancel, reschedule, approve, reject, complete, no-show).
- **Appointment Slots**: generate, list, block/unblock, override create/delete.
- **Profiles**:
  - Patient profile CRUD-like update/read + emergency contacts
  - Doctor profile update/read + image upload + availability + experience
- **Medical Records**: upload/read/update/delete/download.
- **Clinical History Entities**: allergies, conditions, medications full CRUD.
- **Prescriptions**: create/read/update/delete with nested prescription items.
- **Chat**:
  - conversation create/list/read
  - message create/read/delete
  - mark conversation as read
- **Announcements**:
  - admin create/read/update/delete/status patch
  - user read + acknowledgement endpoints
- **Notifications**: list/read/read-all/delete in-app notifications.
- **Feedback/Reviews**:
  - patient submit/edit
  - admin moderate/restore/timeline
- **Governance**: escalation queue read, details read, action execute, close escalation.
- **Settings**:
  - patient settings updates
  - doctor settings updates
  - admin settings + system config updates.

## B) Security and Access-Control Features

- Stateless JWT authentication (`Authorization: Bearer`).
- RBAC policy enforcement (patient/doctor/admin/super_admin).
- Protected frontend routes and backend role decorators.
- Account-status enforcement (e.g., suspended doctor login block).
- Security and governance audit logs.

## C) Realtime and Communication Features

- Socket.IO realtime chat delivery.
- User-room based in-app notification push.
- Realtime vitals event distribution.
- WebRTC call signaling over Socket.IO (offer/answer/ICE).
- Realtime plus fallback polling for chat consistency under network jitter.

## D) Scheduling and Workflow Features

- Slot-based appointment booking workflow.
- Conflict avoidance through slot locking and status checks.
- Rolling-window slot generation.
- Appointment finite-state transitions across patient/doctor/admin actions.
- Consultation call-state transitions with join windows and timeout logic.

## E) Clinical Intelligence Features

- Vitals ingestion API for device streams.
- Threshold + cooldown based critical alerting.
- Auto-notification on critical events.
- PDF assessment report generation from vitals history.

## F) Governance and Quality-Control Features

- Review moderation actions (approve/flag/hide/suspend).
- Escalation case handling and closure workflow.
- Doctor governance telemetry and action history.
- Announcement targeting by role/user/audience with read/ack tracking.

## G) Platform Engineering Features

- Modular Flask blueprint architecture.
- Service-layer business logic separation.
- SQLAlchemy ORM with constraints/indexes/relationships.
- Environment-variable driven deployment configuration.
- Cloud integrations:
  - Cloudinary for file storage
  - Email provider chain (Brevo/Resend/SMTP)
  - Vercel + Render deployment topology.
