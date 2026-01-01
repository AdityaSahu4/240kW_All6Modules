# routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from . import services, schemas
from modules.debugging_request.models import DebuggingRequest


router = APIRouter(prefix="/debugging-request", tags=["Debugging Request"])

@router.get("/{{prefix}_request_id}")
def get_request(debugging_request_id: int, db: Session = Depends(get_db)):
    req = db.query(DebuggingRequest).filter(
        DebuggingRequest.id == debugging_request_id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Not found")

    return {"id": req.id, "status": req.status}

@router.post("/")
def start_debugging_request(db: Session = Depends(get_db)):
    return services.create_debugging_request(db)


@router.post("/{{prefix}_request_id}/product")
def save_product(
    debugging_request_id: int,
    payload: schemas.DebuggingProductDetailsSchema,
    db: Session = Depends(get_db)
):
    services.save_debugging_product_details(db, debugging_request_id, payload)
    return {"status": "saved"}

@router.post("/{{prefix}_request_id}/documents")
def save_documents(
    debugging_request_id: int,
    payload: schemas.DebuggingTechnicalDocumentsSchema,
    db: Session = Depends(get_db)
):
    services.save_debugging_technical_documents(
        db,
        debugging_request_id,
        payload.documents
    )
    return {"status": "documents saved"}

@router.post("/{{prefix}_request_id}/requirements")
def save_requirements(
    debugging_request_id: int,
    payload: schemas.DebuggingRequirementsSchema,
    db: Session = Depends(get_db)
):
    services.save_debugging_requirements(db, debugging_request_id, payload)
    return {"status": "saved"}


@router.post("/{{prefix}_request_id}/standards")
def save_standards(
    debugging_request_id: int,
    payload: schemas.DebuggingStandardsSchema,
    db: Session = Depends(get_db)
):
    services.save_debugging_standards(db, debugging_request_id, payload)
    return {"status": "saved"}


@router.post("/{{prefix}_request_id}/lab-selection/draft")
def save_lab_selection_draft(
    debugging_request_id: int,
    payload: schemas.DebuggingLabSelectionSchema,
    db: Session = Depends(get_db)
):
    """Save lab selection as draft"""
    services.save_debugging_lab_selection_draft(db, debugging_request_id, payload)
    return {"status": "draft saved"}

@router.post("/{{prefix}_request_id}/submit")
def submit(
    debugging_request_id: int,
    payload: schemas.DebuggingLabSelectionSchema,
    db: Session = Depends(get_db)
):
    services.submit_debugging_request(db, debugging_request_id, payload)
    return {"status": "submitted"}


@router.get("/{{prefix}_request_id}/full")
def get_full_request(
    debugging_request_id: int,
    db: Session = Depends(get_db)
):
    data = services.get_full_debugging_request(db, debugging_request_id)

    if not data:
        raise HTTPException(status_code=404, detail="Debugging request not found")

    return data
