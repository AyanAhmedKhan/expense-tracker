# Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites
1. Create a Vercel account and install the Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

### Setup

1. **Create Vercel Project:**
   - Go to [Vercel Dashboard](https://vercel.com/)
   - New Project → Import from your GitHub repo
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **(Optional) Add SPA rewrites:**
    Vercel automatically serves Vite SPAs, but if needed you can add a `vercel.json` in `frontend/`:
    ```json
    {
       "buildCommand": "npm run build",
       "outputDirectory": "dist",
       "rewrites": [
          { "source": "/*", "destination": "/index.html" }
       ]
    }
    ```

3. **Configure environment variables (Vercel):**
    In Vercel Project → Settings → Environment Variables, add:
    - `VITE_API_URL`: `https://your-app.onrender.com/api`
    - `VITE_GOOGLE_CLIENT_ID`: `your-google-client-id.apps.googleusercontent.com`

4. **Local build (optional):**
   ```bash
   cd frontend
   npm run build
   ```

5. **Deploy:**
   - Push to `main` branch; Vercel will auto-build and deploy
   - Or run locally with CLI:
     ```bash
     vercel --prod
     ```

### Automated Deployment

Prefer Vercel’s GitHub integration over custom Actions. After importing the repo, each push to `main` builds and deploys automatically. Configure `Production` and `Preview` environment variables in Vercel settings.

---

## Backend Deployment (Render)

> [!IMPORTANT]
> **Do not use SQLite on Render.** Render's free tier has an "ephemeral filesystem," meaning **all your data will be deleted** every time the server restarts (approx. every 15 minutes of inactivity). You **MUST** use PostgreSQL for persistent data.

### Recommended Method: Blueprints (Auto-Setup)

The easiest way to deploy with a database is using the included `render.yaml` Blueprint.

1.  **Create Blueprint:**
    - Go to [Render Dashboard](https://dashboard.render.com/)
    - Click **New +** -> **Blueprint**
    - Connect your GitHub repository.
    - Give it a name (e.g., `fintrack`).
    - Click **Apply**.

2.  **What happens next:**
    - Render reads `render.yaml`.
    - It automatically creates a **PostgreSQL Database** (`fintrack-db`).
    - It automatically creates the **Web Service** (`fintrack-backend`).
    - It automatically links them together using the `DATABASE_URL` environment variable.

3.  **Finalize Configuration:**
    - Go to your new **Web Service** in the dashboard.
    - Click **Environment**.
    - Add/Update these variables:
        - `CORS_ORIGINS`: `https://your-frontend-url.vercel.app` (Remove any trailing slashes!)
        - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.

### Alternative: Manual Setup (Not Recommended)

If you manually created a Web Service, you must manually add a database:

1.  Create a **PostgreSQL** database on Render.
2.  Copy its `Internal Connection URL`.
3.  Go to your Web Service -> Environment.
4.  Add a variable `DATABASE_URL` and paste the connection URL.
    - *Note: Render provides `postgres://` but our code automatically fixes it to `postgresql://`.*

## Post-Deployment Setup

### Update URLs

1. **Frontend:**
   Ensure `VITE_API_URL` is set in Vercel Project → Settings → Environment Variables.

2. **Backend CORS:**
   Set environment variable in Render:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```

3. **SEO URLs:**
   Update in `frontend/index.html`, `sitemap.xml`, `robots.txt`:
   - Replace `https://yourapp.com/` with your Vercel production URL (e.g., `https://your-app.vercel.app/`)

### Google OAuth Setup

1. **Add Authorized Origins:**
   Go to [Google Cloud Console](https://console.cloud.google.com/)
   → APIs & Services → Credentials → Your OAuth Client

   Add to Authorized JavaScript origins:
   - `https://your-app.vercel.app`
   - `https://your-app.onrender.com` (for backend if needed)

2. **Update Client ID:**
   Ensure both frontend and backend have the same `GOOGLE_CLIENT_ID`

### Database Setup

The application is designed to switch automatically:
- **Local Development**: Uses `sqlite:///./sql_app.db` (created automatically).
- **Production (Render)**: Uses `DATABASE_URL` provided by Render (PostgreSQL).

No manual code changes are needed. The `backend/database.py` file already handles the connection string format (`postgres://` -> `postgresql://`).

---

## Testing Deployment

1. **Frontend:** Visit `https://your-app.web.app`
2. **Backend:** Visit `https://your-app.onrender.com/` (should show welcome message)
3. **Test login:** Try both email/password and Google OAuth
4. **Test offline:** Install PWA, go offline, verify cached content works

---

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGINS` in Render includes your Firebase URL
- Check no trailing slashes in URLs

### API Not Connecting
- Verify `VITE_API_URL` is set correctly in Firebase hosting env
- Check backend logs in Render dashboard

### Google OAuth Not Working
- Verify authorized origins in Google Console
- Ensure same Client ID in both frontend and backend
- Check backend logs for token verification errors

### Build Failures
- Check GitHub Actions logs for frontend
- Check Render build logs for backend
- Verify all environment variables are set

---

## Custom Domain (Optional)

### Firebase Hosting:
1. Go to Firebase Console → Hosting → Add custom domain
2. Follow DNS setup instructions

### Render:
1. Go to Render Dashboard → Settings → Custom Domains
2. Add your domain and configure DNS

Update all URLs in code after setting up custom domains!
