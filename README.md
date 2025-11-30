# FinTrack - Expense Tracking Application

A full-stack expense tracking application with ICICI bank statement parsing, reimbursement management, and comprehensive authentication.

## Features

- 🔐 **Authentication & Authorization**
   - Google OAuth login/signup
  - Protected API routes

- 📊 **Expense Management**
  - ICICI bank statement upload (CSV/PDF)
  - Automatic transaction parsing
  - Credit/Debit categorization with color coding
  - Advanced filtering and sorting
  - Search by description

- 💰 **Reimbursement Tracking**
  - Create reimbursements from selected expenses
  - Track reimbursement history
  - View detailed breakdown of reimbursed items
  - Automatic status updates

- 🌙 **Dark Mode**
  - Toggle between light and dark themes
  - Persistent theme preference
  - Tailwind CSS-based styling

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- SQLite (Database)
- JWT (Authentication)
- bcrypt (Password hashing)
- pdfplumber & pandas (Statement parsing)

### Frontend
- React + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Axios (HTTP client)
- date-fns (Date formatting)
- PWA (vite-plugin-pwa, offline caching)

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at http://localhost:8000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install

   3. **Configure Google OAuth (Optional):**
       - Go to [Google Cloud Console](https://console.cloud.google.com/)
       - Create a new project or select existing
       - Enable Google+ API
       - Create OAuth 2.0 credentials (Web application)
       - Add `http://localhost:5173` to Authorized JavaScript origins
       - Copy the Client ID
       - Update `frontend/src/pages/Login.tsx` and `Signup.tsx`:
          ```typescript
          client_id: 'YOUR_GOOGLE_CLIENT_ID' // Replace with your actual Client ID
          ```
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:5173

## Usage

### First Time Setup

1. **Start both backend and frontend servers** (see Setup Instructions above)

2. **Open the app** at http://localhost:5173

3. **Create an account:**
    - **Option 1: Email/Password**
       - Click "Don't have an account? Sign up"
       - Enter your name, email, and password
       - Click "Sign up"
   
    - **Option 2: Google OAuth**
       - Click "Sign in with Google" on login page
       - Select your Google account
       - Grant permissions
   
    You'll be automatically logged in with either method

### Uploading Statements

1. Navigate to **Upload** page
2. Click to upload a PDF or CSV file (ICICI bank statements)
3. Click "Upload & Parse"
4. View the upload summary

### Managing Expenses

1. Navigate to **Expenses** page
2. Use filters to find specific expenses:
   - Search by description
   - Filter by status (Pending/Partial/Reimbursed)
   - Filter by amount range
   - Filter by date range
   - Sort by date, amount, or description
3. View color-coded amounts:
   - 🔴 Red = Debit (money spent)
   - 🟢 Green = Credit (money received)

### Creating Reimbursements

1. On the **Expenses** page, select expenses to reimburse
   - Note: Only debit expenses can be reimbursed
   - Credits are automatically excluded
2. Click "Reimburse (X)" button
3. Selected expenses will be marked as reimbursed

### Viewing Reimbursement History

1. Navigate to **Reimbursements** page
2. View all past reimbursements
3. Click on any row to expand and see detailed breakdown
4. View individual expenses included in each reimbursement

### Dark Mode

- Click the 🌙 moon icon (desktop) to toggle dark mode
- Theme preference is saved automatically

### PWA (Progressive Web App)

- Installable on desktop and mobile (Add to Home Screen / Install)
- Offline support for previously loaded pages and static assets
- API calls use NetworkFirst strategy; if offline, cached responses may serve (within 1 hour)
- Google Sign-In requires network; if offline, fallback to stored auth token only

To enable fully:
1. Run `npm install` after adding PWA plugin.
2. Build or start dev: `npm run dev` (dev registers service worker only after first reload).
3. In Chrome: Open Application tab → Manifest should load; then use the Install button.

Notes:
- Do NOT cache `/api/auth/login` or `/api/auth/google` aggressively; current strategy only caches successful generic API GETs.
- If you add offline queueing for mutations, implement background sync in `sw.ts`.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Login with Google (coming soon)
- `GET /api/auth/me` - Get current user info

### Statements
- `POST /api/statements/upload` - Upload statement file

### Expenses
- `GET /api/expenses` - Get all expenses (with filters)

### Reimbursements
- `POST /api/reimbursements` - Create reimbursement
- `GET /api/reimbursements` - Get reimbursement history
- `GET /api/reimbursements/{id}/items` - Get reimbursement details

### Summary
- `GET /api/summary` - Get expense summary stats

## Authentication Flow

1. **Signup:** User provides name, email, password → Backend creates user with hashed password → Returns JWT token
2. **Login:** User provides email, password → Backend verifies credentials → Returns JWT token
3. **Token Storage:** Frontend stores JWT in localStorage
4. **API Requests:** Frontend attaches `Authorization: Bearer <token>` header to all requests
5. **Token Validation:** Backend validates JWT on protected routes
6. **Logout:** Frontend removes token from localStorage

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 7 days
- All API routes (except auth) require valid JWT token
- Google OAuth is planned but not yet implemented

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port in uvicorn command
uvicorn main:app --reload --port 8001
```

**Module not found:**
```bash
# Ensure virtual environment is activated and dependencies installed
pip install -r requirements.txt
```

### Frontend Issues

**Port already in use:**
- Vite will automatically prompt you to use a different port

**API connection errors:**
- Ensure backend is running on http://localhost:8000
- Check browser console for CORS errors

**Dark mode not working:**
- Clear localStorage and refresh
- Check browser console for errors

### Common Issues

**401 Unauthorized:**
- Token expired → Logout and login again
- No token → Make sure you're logged in

**422 Validation Error:**
- Check request body format
- Ensure all required fields are provided

**Statement parsing fails:**
- Ensure file is ICICI bank statement (CSV or PDF)
- Check file format and encoding

## Development

### Adding New Features

1. **Backend:** Add routes in `backend/routers/`, models in `backend/models.py`
2. **Frontend:** Add components in `frontend/src/components/`, pages in `frontend/src/pages/`
3. **API:** Update `frontend/src/api/endpoints.ts` with new endpoints

### Database Migrations

The app uses SQLite with SQLAlchemy. Tables are created automatically on startup.

To reset database:
```bash
rm backend/sql_app.db
# Restart backend - tables will be recreated
```

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first.
