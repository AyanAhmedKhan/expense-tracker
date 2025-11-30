# Deployment Guide

## Frontend Deployment (Firebase Hosting)

### Prerequisites
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

### Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Firebase Hosting

2. **Initialize Firebase in your project:**
   ```bash
   cd frontend
   firebase init hosting
   ```
   - Select your Firebase project
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Automatic builds with GitHub: `No` (we'll use GitHub Actions)

3. **Update `.firebaserc`:**
   ```json
   {
     "projects": {
       "default": "your-actual-firebase-project-id"
     }
   }
   ```

4. **Configure environment variables:**
   Create `frontend/.env.production`:
   ```env
   VITE_API_URL=https://your-app.onrender.com/api
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

5. **Build and deploy manually:**
   ```bash
   cd frontend
   npm run build
   firebase deploy --only hosting
   ```

### Automated Deployment (GitHub Actions)

1. **Get Firebase Service Account:**
   ```bash
   firebase login:ci
   ```
   Copy the token generated

2. **Add GitHub Secrets:**
   Go to GitHub repo → Settings → Secrets and variables → Actions
   
   Add these secrets:
   - `FIREBASE_SERVICE_ACCOUNT`: Paste the service account JSON
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `VITE_API_URL`: `https://your-app.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

3. **Deploy automatically:**
   - Push to `main` branch
   - GitHub Actions will build and deploy automatically

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
   - `CORS_ORIGINS`: Your Firebase Hosting URL (e.g., `https://your-app.web.app,https://your-app.firebaseapp.com`)
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
   Update `frontend/.env`:
   ```env
   VITE_API_URL=https://your-app.onrender.com/api
   ```

2. **Backend CORS:**
   Set environment variable in Render:
   ```
   CORS_ORIGINS=https://your-app.web.app,https://your-app.firebaseapp.com
   ```

3. **SEO URLs:**
   Update in `frontend/index.html`, `sitemap.xml`, `robots.txt`:
   - Replace `https://yourapp.com/` with `https://your-app.web.app/`

### Google OAuth Setup

1. **Add Authorized Origins:**
   Go to [Google Cloud Console](https://console.cloud.google.com/)
   → APIs & Services → Credentials → Your OAuth Client

   Add to Authorized JavaScript origins:
   - `https://your-app.web.app`
   - `https://your-app.firebaseapp.com`
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
