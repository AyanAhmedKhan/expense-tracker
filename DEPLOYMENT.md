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

### Prerequisites
1. Create account on [Render](https://render.com/)
2. Connect your GitHub repository

### Setup

1. **Create Web Service on Render:**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repo
   - Select branch: `main`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Add Environment Variables in Render:**
   - `SECRET_KEY`: Generate a strong random string
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `CORS_ORIGINS`: Your Vercel domain(s) (e.g., `https://your-app.vercel.app`)
   - `PYTHON_VERSION`: `3.9.18`

3. **Deploy:**
   - Render will auto-deploy on push to main
   - Or click "Manual Deploy" in Render dashboard

### Using render.yaml (Alternative)

1. **Add `render.yaml` to root:**
   Already created at `d:\fintech\render.yaml`

2. **Create Blueprint:**
   - Render Dashboard → New → Blueprint
   - Connect repo
   - Render will read `render.yaml` and create all services

3. **Configure Environment Variables:**
   - Add secrets in Render dashboard
   - Update `CORS_ORIGINS` with your Firebase URL

---

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

### Database Migration (SQLite → PostgreSQL)

For production, migrate from SQLite to PostgreSQL:

1. **Update backend dependencies:**
   Add to `backend/requirements.txt`:
   ```
   psycopg2-binary
   ```

2. **Update `backend/database.py`:**
   ```python
   import os
   
   DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
   
   # Render provides postgres:// but SQLAlchemy needs postgresql://
   if DATABASE_URL.startswith("postgres://"):
       DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
   
   engine = create_engine(DATABASE_URL)
   ```

3. **Render will auto-create PostgreSQL database** if using `render.yaml`

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
