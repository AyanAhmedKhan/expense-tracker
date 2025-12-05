from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, models, schemas
from database import get_db
from utils import parser
from routers.auth import get_current_user

router = APIRouter(
    prefix="/api/statements",
    tags=["statements"]
)

@router.post("/upload", response_model=schemas.UploadSummary)
async def upload_statement(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        content = await file.read()
        transactions = parser.parse_statement(content, file.filename)
        
        if not transactions:
            # Nothing parsed; record the upload with zero imports and return 200
            crud.create_statement_upload(db, schemas.StatementUploadBase(
                file_name=file.filename,
                num_transactions_imported=0
            ), user_id=current_user.id)
            return {"uploaded": 1, "existing": 0, "new_added": 0}
        
        new_added = 0
        existing = 0
        
        for txn in transactions:
            try:
                txn_hash = parser.generate_transaction_hash(txn["date"], txn["description"], txn["amount"])
                
                # Check if exists
                if crud.get_expense_by_hash(db, txn_hash, user_id=current_user.id):
                    existing += 1
                    continue
                
                # Create new expense
                expense_create = schemas.ExpenseCreate(
                    **txn,
                    transaction_hash=txn_hash
                )
                crud.create_expense(db, expense_create, user_id=current_user.id)
                new_added += 1
            except Exception as e:
                print(f"Error processing transaction: {e}, Transaction: {txn}")
                continue
            
        # Record upload
        crud.create_statement_upload(db, schemas.StatementUploadBase(
            file_name=file.filename,
            num_transactions_imported=new_added
        ), user_id=current_user.id)
        
        return {
            "uploaded": 1,
            "existing": existing,
            "new_added": new_added
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")
