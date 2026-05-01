# Backend Feature Modules

Feature registration now lives in `backend/modules/`.

## Rules

- Each feature package exposes a `register(app)` function.
- `backend/modules/registry.py` is the single place that orders blueprint registration.
- `backend/core/` owns cross-cutting bootstrap concerns such as env loading, CORS, startup migrations, scheduler startup, and socket handler registration.
- Legacy `routes/`, `services/`, and `database/models.py` remain valid compatibility layers until each feature is fully migrated deeper into its module package.
