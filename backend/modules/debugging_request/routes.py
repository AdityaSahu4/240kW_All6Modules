# backend/modules/debugging_request/routes.py

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
)
from sqlalchemy.orm import Session
from typing import List
import os
import json
from uuid import uuid4

from core.database import get_db

from . import services, schemas
from .models import DebuggingRequest

router = APIRouter(prefix="/debugging-request", tags=["Debugging"])

UPLOAD_ROOT = "uploads/debugging"


def save_file(file: UploadFile, folder: str):
    os.makedirs(folder, exist_ok=True)
    filename = f"{uuid4()}_{file.filename}"
    path = os.path.join(folder, filename)

    with open(path, "wb") as buffer:
        buffer.write(file.file.read())

    return path


# -------- Create Request --------
@router.post("/", response_model=schemas.DebuggingRequestResponse)
def start_request(db: Session = Depends(get_db)):
    return services.start_debugging_request(db)


# -------- READ (basic) --------
@router.get("/{request_id}")
def get_request(request_id: int, db: Session = Depends(get_db)):
    req = services.get_request(db, request_id)
    if not req:
        raise HTTPException(404, "Request not found")
    return req


# -------- READ (full composite view) --------
@router.get("/{request_id}/full")
def get_full_request(request_id: int, db: Session = Depends(get_db)):
    result = services.get_full_request(db, request_id)
    if not result:
        raise HTTPException(404, "Request not found")
    return result


# -------- STEP 1 — Product --------
@router.post("/{request_id}/product")
def save_product(
    request_id: int,
    payload: schemas.DebuggingProductSchema,
    db: Session = Depends(get_db),
):
    req = db.get(DebuggingRequest, request_id)
    if not req:
        raise HTTPException(404, "Request not found")

    services.save_product_details(db, request_id, payload)
    return {"status": "saved"}


# -------- STEP 2 — Documents --------
@router.post("/{request_id}/documents")
def upload_documents(
    request_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    req = db.get(DebuggingRequest, request_id)
    if not req:
        raise HTTPException(404, "Request not found")

    paths = [
        {"name": f.filename, "path": save_file(f, f"{UPLOAD_ROOT}/{request_id}/docs")}
        for f in files
    ]

    services.save_documents(db, request_id, paths)
    return {"uploaded": paths}


# -------- STEP 3 — Issue Review --------
@router.post("/{request_id}/issue-review")
def save_issue_review(
    request_id: int,
    data: str = Form(...),
    reports: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    req = db.get(DebuggingRequest, request_id)
    if not req:
        raise HTTPException(404, "Request not found")

    parsed = json.loads(data)

    uploaded = []
    if reports:
        for f in reports:
            uploaded.append(
                {
                    "name": f.filename,
                    "path": save_file(f, f"{UPLOAD_ROOT}/{request_id}/reports"),
                }
            )

    payload = schemas.IssueReviewSchema(data=parsed, reports=uploaded)

    services.save_issue_review(db, request_id, payload)

    return {"status": "saved", "reports": uploaded}


# -------- Submit --------
@router.post("/{request_id}/submit")
def submit_request(request_id: int, db: Session = Depends(get_db)):
    result = services.submit_request(db, request_id)

    if not result:
        raise HTTPException(404, "Request not found")

    return {"status": "submitted", "request_id": request_id}
