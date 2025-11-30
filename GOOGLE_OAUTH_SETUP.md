# Google OAuth Setup Guide

## Quick Start

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "FinTrack App")
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: External
   - App name: FinTrack
   - User support email: Your email
   - Developer contact: Your email
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: FinTrack Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - Add your production URL later
   - No redirect URIs needed for Google Identity Services
7. Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### 2. Configure Frontend

1. Create `.env` file in `frontend/` directory:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `.env` and add your Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ### 2.5 Configure Backend (Recommended)

   1. Create `.env` in `backend/` directory based on `.env.example`:
      ```bash
      cd backend
      copy .env.example .env
      ```
   2. Edit `.env` and add your Client ID:
      ```env
      SECRET_KEY=change-this-in-production
      GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
      ```
   3. Restart backend:
      ```bash
      uvicorn main:app --reload
      ```

   ```

### 3. Test Google Login

1. Open http://localhost:5173
2. Click "Sign in with Google"
3. Select your Google account
4. Grant permissions
5. You should be logged in!

## How It Works

### Frontend (Google Identity Services)
- Uses Google's One Tap sign-in
- Receives a JWT credential token from Google
- Sends token to backend for verification

### Backend (google-auth library)
- Receives Google JWT token
- Verifies token authenticity with Google's public keys
- Extracts user info (email, name, google_id)
- Creates user account if new, or logs in existing user
- Returns our own JWT token for API authentication

## Security Notes

- ✅ Tokens are verified server-side with Google's API
- ✅ No client secrets needed (using implicit flow)
- ✅ User emails are verified by Google
- ✅ Works alongside email/password authentication
- ⚠️ In production:
  - Set `SECRET_KEY` environment variable in backend
  - Add production domain to Google OAuth settings
  - Use HTTPS for all connections
   - Do NOT commit client secrets; Google Identity Services for the web (One Tap/button) does not require a client secret in the frontend. The backend uses the Client ID only for audience verification.

## Troubleshooting

### "Google Sign-In not loaded"
- Check internet connection
- Verify Google script loaded in `index.html`
- Check browser console for errors

### "Invalid Google token"
- Ensure `google-auth` library installed: `pip install google-auth`
- Backend must be running
- Check backend logs for detailed error

### "Email already registered"
- User exists with email/password auth
- They can log in with their password
- Google ID will be linked on first Google login

## Without Google OAuth

The app works perfectly without Google OAuth configured:
- Users can still sign up with email/password
- "Sign in with Google" button will show error message
- All other features work normally

Simply skip the OAuth setup if you don't need it!
