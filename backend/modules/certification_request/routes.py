# routes.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from . import services, schemas
from .models import CertificationRequest

router = APIRouter(prefix="/certification-request", tags=["Certification Request"])

@router.get("/draft")
def get_existing_draft(db: Session = Depends(get_db)):
    """Find the most recent draft certification request"""
    draft = db.query(CertificationRequest).filter(
        CertificationRequest.status == "draft"
    ).order_by(CertificationRequest.created_at.desc()).first()
    
    if draft:
        return {
            "id": draft.id,
            "status": draft.status,
            "target_region": draft.target_region,
            "product_name": draft.product_name,
            "product_category": draft.product_category,
            "standards": draft.standards,
            "estimated_fee_range": draft.estimated_fee_range,
            "additional_notes": draft.additional_notes,
        }
    
    raise HTTPException(status_code=404, detail="No draft found")

@router.get("/{certification_request_id}")
def get_request(certification_request_id: int, db: Session = Depends(get_db)):
    req = db.query(CertificationRequest).filter(
        CertificationRequest.id == certification_request_id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Not found")

    return {"id": req.id, "status": req.status}

@router.post("/")
def start_certification_request(db: Session = Depends(get_db)):
    return services.create_certification_request(db)

@router.post("/{certification_request_id}/details")
def save_details(
    certification_request_id: int,
    payload: schemas.CertificationDetailsSchema,
    db: Session = Depends(get_db)
):
    try:
        return services.save_certification_details(db, certification_request_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{certification_request_id}/upload-documents")
def upload_documents(
    certification_request_id: int,
    files: List[UploadFile] = File(...),
    doc_types: List[str] = Form(...),
    db: Session = Depends(get_db)
):
    return services.save_certification_uploaded_files(
        db,
        certification_request_id,
        files,
        doc_types
    )

@router.post("/{certification_request_id}/lab-selection/draft")
def save_lab_selection_draft(
    certification_request_id: int,
    payload: schemas.CertificationLabSelectionSchema,
    db: Session = Depends(get_db)
):
    """Save lab selection as draft"""
    services.save_certification_lab_selection_draft(db, certification_request_id, payload)
    return {"status": "draft saved"}

@router.post("/{certification_request_id}/submit")
def submit(
    certification_request_id: int,
    payload: schemas.CertificationLabSelectionSchema,
    db: Session = Depends(get_db)
):
    services.submit_certification_request(db, certification_request_id, payload)
    return {"status": "submitted"}


@router.get("/{certification_request_id}/full")
def get_full_request(
    certification_request_id: int,
    db: Session = Depends(get_db)
):
    data = services.get_full_certification_request(db, certification_request_id)

    if not data:
        raise HTTPException(status_code=404, detail="Certification request not found")

    return data

@router.delete("/cleanup-drafts")
def cleanup_old_drafts(keep_latest: int = 1, db: Session = Depends(get_db)):
    deleted_count = services.cleanup_old_drafts(db, keep_latest)
    return {
        "status": "success",
        "deleted_count": deleted_count,
        "message": f"Deleted {deleted_count} old draft(s)"
    }