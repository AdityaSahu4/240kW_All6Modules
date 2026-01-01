# routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from . import services, schemas
from modules.certification_request.models import CertificationRequest


router = APIRouter(prefix="/certification-request", tags=["Certification Request"])

@router.get("/{{prefix}_request_id}")
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


@router.post("/{{prefix}_request_id}/product")
def save_product(
    certification_request_id: int,
    payload: schemas.CertificationProductDetailsSchema,
    db: Session = Depends(get_db)
):
    services.save_certification_product_details(db, certification_request_id, payload)
    return {"status": "saved"}

@router.post("/{{prefix}_request_id}/documents")
def save_documents(
    certification_request_id: int,
    payload: schemas.CertificationTechnicalDocumentsSchema,
    db: Session = Depends(get_db)
):
    services.save_certification_technical_documents(
        db,
        certification_request_id,
        payload.documents
    )
    return {"status": "documents saved"}

@router.post("/{{prefix}_request_id}/requirements")
def save_requirements(
    certification_request_id: int,
    payload: schemas.CertificationRequirementsSchema,
    db: Session = Depends(get_db)
):
    services.save_certification_requirements(db, certification_request_id, payload)
    return {"status": "saved"}


@router.post("/{{prefix}_request_id}/standards")
def save_standards(
    certification_request_id: int,
    payload: schemas.CertificationStandardsSchema,
    db: Session = Depends(get_db)
):
    services.save_certification_standards(db, certification_request_id, payload)
    return {"status": "saved"}


@router.post("/{{prefix}_request_id}/lab-selection/draft")
def save_lab_selection_draft(
    certification_request_id: int,
    payload: schemas.CertificationLabSelectionSchema,
    db: Session = Depends(get_db)
):
    """Save lab selection as draft"""
    services.save_certification_lab_selection_draft(db, certification_request_id, payload)
    return {"status": "draft saved"}

@router.post("/{{prefix}_request_id}/submit")
def submit(
    certification_request_id: int,
    payload: schemas.CertificationLabSelectionSchema,
    db: Session = Depends(get_db)
):
    services.submit_certification_request(db, certification_request_id, payload)
    return {"status": "submitted"}


@router.get("/{{prefix}_request_id}/full")
def get_full_request(
    certification_request_id: int,
    db: Session = Depends(get_db)
):
    data = services.get_full_certification_request(db, certification_request_id)

    if not data:
        raise HTTPException(status_code=404, detail="Certification request not found")

    return data
