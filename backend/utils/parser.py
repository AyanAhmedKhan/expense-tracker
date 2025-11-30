import pdfplumber
import pandas as pd
import hashlib
from datetime import datetime
import io
import re

def generate_transaction_hash(date: datetime, description: str, amount: float) -> str:
    # Create a unique hash based on date, description, and amount
    data = f"{date.isoformat()}{description}{amount}"
    return hashlib.sha256(data.encode()).hexdigest()

def parse_amount(amount_str):
    if isinstance(amount_str, (int, float)):
        return float(amount_str)
    if not amount_str:
        return 0.0
    # Remove commas and handle currency symbols if present
    clean_str = str(amount_str).replace(',', '').replace('₹', '').strip()
    try:
        return float(clean_str)
    except ValueError:
        return 0.0

def parse_date(date_str):
    if not isinstance(date_str, str):
        return None
    # Clean the date string
    date_str = date_str.strip()
    # Try common formats including the ICICI format like "1/10/2025", "2/10/2025", "13-10-2025"
    formats = ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d', '%d-%b-%Y', '%-d/%-m/%Y', '%-d-%-m-%Y']
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    # Try without leading zeros
    try:
        parts = date_str.replace('-', '/').split('/')
        if len(parts) == 3:
            day, month, year = parts
            return datetime(int(year), int(month), int(day))
    except:
        pass
    
    return None

def parse_pdf(file_content: bytes):
    transactions = []
    try:
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            for page in pdf.pages:
                table = page.extract_table()
                if not table:
                    continue
                # Find header row
                header_row = None
                for row in table:
                    if row and any("Withdrawal" in str(c) for c in row):
                        header_row = row
                        break
                # Map column indices
                if header_row:
                    col_map = {name: idx for idx, name in enumerate(header_row)}
                    date_idx = col_map.get('Value Date', col_map.get('Transaction Date', 1))
                    desc_idx = col_map.get('Transaction Remarks', 4)
                    withdrawal_idx = col_map.get('Withdrawal\nAmount(INR)', col_map.get('Withdrawal Amount(INR)', 5))
                    deposit_idx = col_map.get('Deposit\nAmount(INR)', col_map.get('Deposit Amount(INR)', 6))
                else:
                    # Fallback to default indices
                    date_idx, desc_idx, withdrawal_idx, deposit_idx = 1, 4, 5, 6
                # Process rows
                for row in table:
                    if not row or row == header_row:
                        continue
                    # Skip empty or non-transaction rows
                    if not row[date_idx] or not row[desc_idx]:
                        continue
                    date_val = parse_date(str(row[date_idx]))
                    description = str(row[desc_idx]).replace('\n', ' ').strip()
                    withdrawals = parse_amount(row[withdrawal_idx]) if withdrawal_idx < len(row) else 0.0
                    deposits = parse_amount(row[deposit_idx]) if deposit_idx < len(row) else 0.0
                    if withdrawals > 0 and description and date_val:
                        transactions.append({
                            "date": date_val,
                            "description": description,
                            "amount": withdrawals,
                            "source": "ICICI PDF"
                        })
                    if deposits > 0 and description and date_val:
                        transactions.append({
                            "date": date_val,
                            "description": description,
                            "amount": -deposits,
                            "source": "ICICI PDF"
                        })
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        import traceback
        traceback.print_exc()
    return transactions

def _parse_text_lines_icici(text: str):
    """Parse ICICI-like statement text with columns: DATE, MODE, PARTICULARS, DEPOSITS, WITHDRAWALS, BALANCE."""
    transactions = []
    lines = text.splitlines()
    for raw in lines:
        line = raw.strip()
        if not line or line.lower().startswith("date"):
            continue
        m = re.match(r"^(\d{1,2}[\-/]\d{1,2}[\-/]\d{4})", line)
        if not m:
            continue
        date_str = m.group(1)
        date_val = parse_date(date_str)
        if not date_val:
            continue
        # Try tab, then 2+ spaces, then single space
        if "\t" in line:
            tokens = line.split("\t")
        elif re.search(r"\s{2,}", line):
            tokens = re.split(r"\s{2,}", line)
        else:
            tokens = line.split(",") if "," in line else line.split()
        tokens = [t.strip() for t in tokens if t.strip()]
        # Accept both with and without MODE column
        if len(tokens) == 6:
            # DATE, MODE, PARTICULARS, DEPOSITS, WITHDRAWALS, BALANCE
            description = tokens[2]
            withdrawals = parse_amount(tokens[4])
        elif len(tokens) == 5:
            # DATE, PARTICULARS, DEPOSITS, WITHDRAWALS, BALANCE
            description = tokens[1]
            withdrawals = parse_amount(tokens[3])
        else:
            continue
        if withdrawals > 0 and description:
            transactions.append({
                "date": date_val,
                "description": description,
                "amount": withdrawals,
                "source": "ICICI CSV"
            })
    return transactions

def parse_csv(file_content: bytes):
    transactions = []
    try:
        df = None
        for kwargs in (
            {},
            {"sep": None, "engine": "python"},
            {"sep": ","},
            {"sep": "\t"},
            {"sep": r"\s+", "engine": "python"},
        ):
            try:
                df = pd.read_csv(io.BytesIO(file_content), **kwargs)
                if df is not None and df.shape[1] >= 2:
                    break
            except Exception:
                df = None

        if df is not None and not df.empty:
            df.columns = df.columns.astype(str).str.strip().str.lower()
            date_col = next((c for c in df.columns if 'date' in c), None)
            withdraw_col = next((c for c in df.columns if 'withdrawal' in c or 'withdrawals' in c or 'debit' in c), None)
            deposit_col = next((c for c in df.columns if 'deposit' in c or 'credit' in c), None)
            desc_col = next((c for c in df.columns if 'particulars' in c or 'description' in c or 'narration' in c or 'remarks' in c), None)
            mode_col = next((c for c in df.columns if 'mode' in c), None)
            for _, row in df.iterrows():
                date_val = parse_date(str(row.get(date_col, ""))) if date_col else None
                if not date_val:
                    continue
                withdrawals = parse_amount(row.get(withdraw_col, 0)) if withdraw_col else 0.0
                deposits = parse_amount(row.get(deposit_col, 0)) if deposit_col else 0.0
                description = str(row.get(desc_col, "")).strip() if desc_col else ""
                # If mode column exists, append it to description for more context
                if mode_col and row.get(mode_col):
                    description = f"{row.get(mode_col)} {description}".strip()
                if withdrawals > 0 and description:
                    transactions.append({
                        "date": date_val,
                        "description": description,
                        "amount": withdrawals,
                        "source": "ICICI CSV"
                    })
                if deposits > 0 and description:
                    transactions.append({
                        "date": date_val,
                        "description": description,
                        "amount": -deposits,
                        "source": "ICICI CSV"
                    })
        # Fallback to manual text parsing if no transactions found
        if not transactions:
            try:
                text = io.BytesIO(file_content).read().decode('utf-8', errors='ignore')
            except Exception:
                text = file_content.decode('latin-1', errors='ignore')
            transactions = _parse_text_lines_icici(text)
    except Exception as e:
        print(f"Error parsing CSV: {e}")
        import traceback
        traceback.print_exc()
    return transactions

def parse_statement(file_content: bytes, filename: str):
    name = filename.lower()
    if name.endswith('.pdf'):
        return parse_pdf(file_content)
    if name.endswith('.csv'):
        txns = parse_csv(file_content)
        if txns:
            return txns
        # Fallback to text
        try:
            text = io.BytesIO(file_content).read().decode('utf-8', errors='ignore')
        except Exception:
            text = file_content.decode('latin-1', errors='ignore')
        return _parse_text_lines_icici(text)
    # Generic fallback for unknown extensions
    try:
        text = io.BytesIO(file_content).read().decode('utf-8', errors='ignore')
    except Exception:
        text = file_content.decode('latin-1', errors='ignore')
    return _parse_text_lines_icici(text)