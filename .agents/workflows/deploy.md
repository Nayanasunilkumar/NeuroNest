---
description: How to safely deploy changes to the NeuroNest production environment
---
# NeuroNest Production Deployment Workflow

This workflow enforces a strict, zero-downtime, safe deployment pipeline across Vercel (Frontend) and Render (Backend). Do not push directly to `main` without completing these steps.

## Phase 1: Local Development & Pre-flight Checks (Feature Branch)

Always work on a feature branch, never `main`.

1. **Ensure you are on a clean working directory:**
   ```bash
   git status
   ```

2. **Always pull the latest changes before branching:**
   ```bash
   git checkout main
   git pull origin main
   ```

3. **Create a descriptive feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # Examples: feature/video-call-ui, fix/auth-token-crash, chore/update-deps
   ```

4. **Verify Environment Variables Local vs Prod:**
   * Ensure your local `.env` values are working on `localhost`.
   * **STOP.** Does this feature require *new* environment variables?
     * If **Yes:** Add them to the Render Dashboard (Backend) and Vercel Dashboard (Frontend) *before* deploying. Do not commit `.env`.

5. **Test Backend Locally:**
   ```bash
   cd backend
   source venv/bin/activate
   flask db upgrade  # If you generated a migration!
   python3 app.py
   # Verify health endpoint: curl http://localhost:5000/
   ```

6. **Test Frontend Locally:**
   ```bash
   cd frontend
   npm run dev
   # Verify UI looks correct and API calls succeed locally
   ```

## Phase 2: Commit & Preview Deployment

7. **Stage and commit your changes:**
   ```bash
   git add .
   git commit -m "feat: description of the amazing feature you built"
   ```

8. **Push the feature branch to GitHub:**
   ```bash
   git push origin feature/your-feature-name
   ```
   * *Vercel will automatically detect this branch and build a **Preview Deployment URL** without touching Production.*

9. **Verify Vercel Preview (Frontend):**
   * Go to your Vercel Dashboard.
   * Find the Preview URL for your branch (e.g., `https://neuro-nest-git-feature-name-your-team.vercel.app`).
   * Test the UI. *Note: The Preview UI will still point to your live Render Backend unless you configured a staging backend.*

10. **Verify Render Backend (If Backend Changes Exist):**
    * Render free tier does not natively support isolated Preview environments out-of-the-box like Vercel. 
    * If you pushed backend code, *you must be 100% sure it works locally* because merging this branch will instantly push the backend code live.

## Phase 3: Merging & Production Deployment

Only proceed when the Preview works flawlessly.

11. **Merge into Main (Initiates Production Build):**
    ```bash
    git checkout main
    git pull origin main
    git merge feature/your-feature-name
    ```

12. **Deploy to Production!**
    ```bash
    git push origin main
    ```
    * 🚀 *This triggers a simultaneous build on Vercel (`Production`) and Render (`Main Web Service`).*

## Phase 4: Production Verification & Monitoring

13. **Monitor Render Logs (Backend):**
    * Go to **Render Dashboard** -> `neuronest-backend` -> **Logs**.
    * Wait for: `Build successful 🎉` and `Gunicorn listening at: http://0.0.0.0:10000 (1)`.
    * *Verify Health:*
      ```bash
      curl -s https://neuronest-backend-2rn0.onrender.com/ | grep "NeuroNest backend running"
      ```

14. **Monitor Vercel Logs (Frontend):**
    * Go to **Vercel Dashboard** -> `neuro-nest`.
    * Wait for the Deployment Status to show `Ready (Production)`.

15. **Verify API Connectivity:**
    * Open `https://neuro-nest-two.vercel.app`.
    * Open Browser DevTools (F12) -> **Network Tab**.
    * Log in. Ensure you receive a `200 OK` from `https://neuronest-backend-2rn0.onrender.com/auth/login`.

## Phase 5: Instant Rollback Strategy (Emergency Only)

If the deployment broke production (API failing, 500 errors, broken UI), execute this instantly.

16. **Identify the last known good commit:**
    ```bash
    git log --oneline -n 5
    # Find the commit hash before your merge, e.g., 'a1b2c3d'
    ```

17. **Hard Rollback and Force Push (DANGER):**
    ```bash
    git reset --hard <GOOD_COMMIT_HASH>
    git push -f origin main
    ```
    * *Vercel and Render will instantly detect the force push and revert their live servers to the exact state of that old commit.*

18. *(Optional)* **Vercel Instant Rollback (Frontend Only):**
    * If only the UI broke, go to Vercel Dashboard -> Deployments.
    * Click the three dots `...` next to the previous successful Production deployment -> **"Promote to Production"** or **"Rollback"**. (This is instantaneous, ~1 second).
