# routes.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from . import services, schemas
from modules.calibration_request.models import CalibrationRequest


router = APIRouter(prefix="/calibration-request", tags=["Calibration Request"])

@router.get("/{calibration_request_id}")
def get_request(calibration_request_id: int, db: Session = Depends(get_db)):
    req = db.query(CalibrationRequest).filter(
        CalibrationRequest.id == calibration_request_id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Not found")

    return {"id": req.id, "status": req.status}

@router.post("/")
def start_calibration_request(db: Session = Depends(get_db)):
    return services.create_calibration_request(db)


@router.post("/{calibration_request_id}/product")
def save_product(
    calibration_request_id: int,
    payload: schemas.CalibrationProductDetailsSchema,
    db: Session = Depends(get_db)
):
    services.save_calibration_product_details(db, calibration_request_id, payload)
    return {"status": "saved"}

@router.post("/{calibration_request_id}/upload-documents")
async def upload_documents(
    calibration_request_id: int,
    files: List[UploadFile] = File(...),
    doc_types: List[str] = Form(...),
    db: Session = Depends(get_db)
):
    """
    Upload technical documents for a calibration request.
    Files are stored in backend/database/upload/calibration_requests/{request_id}/
    """
    try:
        saved_files = services.save_calibration_uploaded_files(
            db,
            calibration_request_id,
            files,
            doc_types
        )
        return {"status": "success", "files": saved_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload files: {str(e)}")

@router.post("/{calibration_request_id}/documents")
def save_documents(
    calibration_request_id: int,
    payload: schemas.CalibrationTechnicalDocumentsSchema,
    db: Session = Depends(get_db)
):
    services.save_calibration_technical_documents(
        db,
        calibration_request_id,
        payload.documents
    )
    return {"status": "documents saved"}

@router.post("/{calibration_request_id}/requirements")
def save_requirements(
    calibration_request_id: int,
    payload: schemas.CalibrationRequirementsSchema,
    db: Session = Depends(get_db)
):
    services.save_calibration_requirements(db, calibration_request_id, payload)
    return {"status": "saved"}


@router.post("/{calibration_request_id}/standards")
def save_standards(
    calibration_request_id: int,
    payload: schemas.CalibrationStandardsSchema,
    db: Session = Depends(get_db)
):
    services.save_calibration_standards(db, calibration_request_id, payload)
    return {"status": "saved"}


@router.post("/{calibration_request_id}/confirmation")
def save_confirmation(
    calibration_request_id: int,
    payload: schemas.CalibrationConfirmationSchema,
    db: Session = Depends(get_db)
):
    """Save calibration confirmation checkboxes from details page"""
    services.save_calibration_confirmation(db, calibration_request_id, payload)
    return {"status": "confirmation saved"}


@router.post("/{calibration_request_id}/approval")
def save_approval(
    calibration_request_id: int,
    payload: schemas.CalibrationApprovalSchema,
    db: Session = Depends(get_db)
):
    """Save calibration approval checkboxes from review page"""
    services.save_calibration_approval(db, calibration_request_id, payload)
    return {"status": "approval saved"}



@router.post("/{calibration_request_id}/lab-selection/draft")
def save_lab_selection_draft(
    calibration_request_id: int,
    payload: schemas.CalibrationLabSelectionSchema,
    db: Session = Depends(get_db)
):
    """Save lab selection as draft"""
    services.save_calibration_lab_selection_draft(db, calibration_request_id, payload)
    return {"status": "draft saved"}

@router.post("/{calibration_request_id}/submit")
def submit(
    calibration_request_id: int,
    payload: schemas.CalibrationLabSelectionSchema,
    db: Session = Depends(get_db)
):
    services.submit_calibration_request(db, calibration_request_id, payload)
    return {"status": "submitted"}


@router.get("/{calibration_request_id}/full")
def get_full_request(
    calibration_request_id: int,
    db: Session = Depends(get_db)
):
    data = services.get_full_calibration_request(db, calibration_request_id)

    if not data:
        raise HTTPException(status_code=404, detail="Calibration request not found")

    return data
