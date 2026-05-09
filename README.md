# NeuroNest Hospital Management and Monitoring System

This project is organized around the three runtime roles in the system:
Admin, Patient, and Doctor.

## Frontend Structure

- `frontend/src/admin` contains admin route registration, admin services, and role-scoped extension points.
- `frontend/src/patient` contains patient route registration, patient services, and role-scoped extension points.
- `frontend/src/doctor` contains doctor route registration, doctor services, and role-scoped extension points.
- `frontend/src/shared` contains shared constants, API client exports, components, and utility exports.
- `frontend/src/modules` contains the current feature modules used by the role route registries.

Role route files are the canonical navigation surface:

- `frontend/src/admin/adminRoutes.js`
- `frontend/src/patient/patientRoutes.js`
- `frontend/src/doctor/doctorRoutes.js`

## Backend Structure

- `backend/modules/admin` registers admin features and applies centralized admin role protection.
- `backend/modules/patient` registers patient-facing features.
- `backend/modules/doctor` registers doctor-facing features.
- `backend/modules/shared` contains reusable middleware, config, and utility extension points.
- `backend/modules/registry.py` is the single feature-module registration entrypoint used by the app factory.

The shared role middleware lives at:

- `backend/modules/shared/middleware/role_required.py`

## Refactoring Notes

Legacy feature files remain in place where moving them would require broad import churn. New work should enter through the role modules first, then migrate individual pages, components, controllers, services, models, and validators into the matching role folder as features are touched.

## WebRTC TURN Configuration

Video consultations load ICE servers from `GET /api/rtc/ice-config`. STUN is always returned, but production calls across NATs require TURN relay credentials from a provider such as Metered.ca or Twilio Network Traversal.

Set these Render backend environment variables together:

- `TURN_URLS`: comma-separated TURN URLs, for example `turn:your-domain.metered.live:80,turn:your-domain.metered.live:443,turns:your-domain.metered.live:443`
- `TURN_USERNAME`: provider-issued TURN username
- `TURN_CREDENTIAL`: provider-issued TURN password/credential

After deployment, call `/api/rtc/ice-config` with a valid JWT and confirm the response includes the default STUN entries plus a TURN entry with `urls`, `username`, and `credential`. During a consultation, the debug overlay should show `ICE cfg: ... (TURN+STUN)`, relay candidate counts, and the selected candidate pair once ICE reaches `connected` or `completed`.
