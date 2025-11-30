# Quick Start Guide

## Start the Application in 3 Steps

### 1. Start Backend (Terminal 1)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
✅ Backend running at http://localhost:8000

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend running at http://localhost:5173

### 3. Open Browser
Navigate to http://localhost:5173

## First Use

1. **Sign Up**
   - Click "Don't have an account? Sign up"
   - Enter your name, email, and password (min 6 characters)
   - Click "Sign up"

2. **Upload Statement**
   - Go to Upload page
   - Upload ICICI bank statement (CSV or PDF)
   - Click "Upload & Parse"

3. **View Expenses**
   - Go to Expenses page
   - See all transactions with color coding:
     - 🔴 Red = Debits (money spent)
     - 🟢 Green = Credits (money received)

4. **Create Reimbursement**
   - Select expenses to reimburse (only debits)
   - Click "Reimburse (X)"

5. **View History**
   - Go to Reimbursements page
   - Click any row to see detailed breakdown

## Features at a Glance

- ✅ Login/Signup with email + password
- ✅ JWT authentication
- ✅ Upload ICICI statements (PDF/CSV)
- ✅ Filter & sort expenses
- ✅ Create reimbursements
- ✅ Track reimbursement history
- ✅ Dark mode toggle
- ⏳ Google OAuth (coming soon)

## Troubleshooting

**Can't login?**
- Check if backend is running
- Clear browser localStorage
- Try signup again

**Upload fails?**
- Ensure file is ICICI bank statement
- Check file format (PDF or CSV)

**401 Unauthorized?**
- Logout and login again (token expired)

For detailed documentation, see README.md
