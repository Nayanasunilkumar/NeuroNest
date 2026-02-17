# Modular Sidebar Architecture

Each module is isolated in its own folder and exports a config object.

## Folder Structure

```
frontend/src/modules/
  dashboard/
    index.js
  profile/
    index.js
  appointment-requests/
    index.js
  today-schedule/
    index.js
  my-patients/
    index.js
  write-prescription/
    index.js
  assessment-reports/
    index.js
  performance-analytics/
    index.js
  alerts/
    index.js
  patient-chat/
    index.js
  settings/
    index.js
  ...
  moduleRegistry.js
```

`moduleRegistry.js` is the single source of truth for sidebar + route generation.
Future server toggles can override `enabledByDefault` through `/api/modules/config`.
