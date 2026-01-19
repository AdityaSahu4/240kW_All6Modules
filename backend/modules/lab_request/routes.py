# backend/modules/lab_request/routes.py

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from . import services, schemas

router = APIRouter(prefix="/lab-requests", tags=["Lab Requests"])


# ------------------------------------------------------------
# CREATE NEW LAB REQUEST
# ------------------------------------------------------------
@router.post("/")
def create_lab_request(
    payload: schemas.LabRequestCreateSchema,
    db: Session = Depends(get_db)
):
    return services.create_lab_request(
        db,
        product_name=payload.product_name,
        service_type=payload.service_type
    )


# ------------------------------------------------------------
# GET ALL LAB REQUESTS
# ------------------------------------------------------------
@router.get("/")
def get_lab_requests(db: Session = Depends(get_db)):
    return services.get_all_lab_requests(db)


# ------------------------------------------------------------
# GET FULL REQUEST DETAILS
# ------------------------------------------------------------
@router.get("/{lab_request_id}/full")
def get_full_lab_request(lab_request_id: int, db: Session = Depends(get_db)):
    data = services.get_full_lab_request(db, lab_request_id)
    if not data:
        raise HTTPException(status_code=404, detail="Lab request not found")
    return data


# ------------------------------------------------------------
# UPDATE STATUS + STATUS LOG
# ------------------------------------------------------------
@router.put("/{lab_request_id}/status")
def update_status(
    lab_request_id: int,
    payload: schemas.LabStatusUpdateSchema,
    db: Session = Depends(get_db)
):
    updated = services.update_lab_request_status(
        db,
        lab_request_id,
        new_status=payload.new_status,
        changed_by=payload.changed_by
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Lab request not found")

    return {"status": "updated", "request": updated}


# ------------------------------------------------------------
# ADD PROGRESS UPDATE
# ------------------------------------------------------------
@router.post("/{lab_request_id}/progress")
def add_progress(
    lab_request_id: int,
    payload: schemas.LabProgressSchema,
    db: Session = Depends(get_db)
):
    return services.add_lab_progress(
        db,
        lab_request_id,
        percent=payload.progress_percent,
        notes=payload.notes,
        updated_by=payload.updated_by
    )


# ------------------------------------------------------------
# ASSIGN / REASSIGN ENGINEER
# ------------------------------------------------------------
@router.put("/{lab_request_id}/assign")
def assign_engineer(
    lab_request_id: int,
    payload: schemas.LabAssignmentSchema,
    db: Session = Depends(get_db)
):
    result = services.assign_lab_engineer(
        db,
        lab_request_id,
        engineer_id=payload.engineer_id,
        assigned_by=payload.assigned_by
    )

    if not result:
        raise HTTPException(status_code=404, detail="Lab request not found")

    return {"status": "assigned", "assignment": result}


# ------------------------------------------------------------
# CREATE SCHEDULE ENTRY
# ------------------------------------------------------------
@router.post("/{lab_request_id}/schedule")
def create_schedule(
    lab_request_id: int,
    payload: schemas.LabScheduleSchema,
    db: Session = Depends(get_db)
):
    return services.create_lab_schedule(
        db,
        lab_request_id,
        engineer_id=payload.engineer_id,
        start=payload.start_datetime,
        end=payload.end_datetime,
        status=payload.schedule_status
    )


# ------------------------------------------------------------
# UPLOAD DOCUMENTS
# ------------------------------------------------------------
@router.post("/{lab_request_id}/documents")
def upload_documents(
    lab_request_id: int,
    files: List[UploadFile] = File(...),
    doc_types: List[str] = File(...),   # Must align order with files[]
    uploaded_by: str = "system",
    db: Session = Depends(get_db)
):
    return services.upload_lab_documents(
        db,
        lab_request_id,
        files=files,
        doc_types=doc_types,
        uploaded_by=uploaded_by
    )


# ------------------------------------------------------------
# DELETE DOCUMENT
# ------------------------------------------------------------
@router.delete("/documents/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    ok = services.delete_lab_document(db, document_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "deleted"}
