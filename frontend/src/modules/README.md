# Modular Feature Architecture

Each feature now resolves through its own module folder first, even when a legacy page still exists underneath as a compatibility bridge.

## Folder Structure

```text
frontend/src/modules/
  dashboard/
    index.js
    PatientDashboardPage.jsx
    DoctorDashboardPage.jsx
    AdminDashboardPage.jsx
  book-appointment/
    index.js
    BookAppointmentPage.jsx
  settings/
    index.js
    PatientSettingsModulePage.jsx
    DoctorSettingsModulePage.jsx
    AdminSettingsModulePage.jsx
  ...
  moduleRegistry.js
```

## Rules

- `moduleRegistry.js` remains the routing and sidebar source of truth.
- Route components should be imported from the module folder, not directly from `pages/`.
- Legacy `pages/`, `services/`, and `components/` files can remain as compatibility shims while features are migrated deeper into the module folder.
- Server-driven toggles can still override `enabledByDefault` through `/api/modules/config`.
