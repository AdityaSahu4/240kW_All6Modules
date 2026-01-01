# routes.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from . import services, schemas
from modules.design_request.models import DesignRequest


router = APIRouter(prefix="/design-request", tags=["Design Request"])

@router.get("/{design_request_id}")
def get_request(design_request_id: int, db: Session = Depends(get_db)):
    dr = db.query(DesignRequest).filter(
        DesignRequest.id == design_request_id
    ).first()

    if not dr:
        raise HTTPException(status_code=404, detail="Not found")

    return {"id": dr.id, "status": dr.status}

@router.post("/")
def start_design_request(db: Session = Depends(get_db)):
    return services.create_design_request(db)


@router.post("/{design_request_id}/product")
def save_product(
    design_request_id: int,
    payload: schemas.DesignProductDetailsSchema,
    db: Session = Depends(get_db)
):
    services.save_design_product_details(db, design_request_id, payload)
    return {"status": "saved"}

@router.post("/{design_request_id}/upload-documents")
async def upload_documents(
    design_request_id: int,
    files: List[UploadFile] = File(...),
    doc_types: List[str] = Form(...),
    db: Session = Depends(get_db)
):
    """
    Upload technical documents for a design request.
    Files are stored in backend/database/upload/design_requests/{request_id}/
    """
    try:
        saved_files = services.save_design_uploaded_files(
            db,
            design_request_id,
            files,
            doc_types
        )
        return {"status": "success", "files": saved_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload files: {str(e)}")

@router.post("/{design_request_id}/documents")
def save_documents(
    design_request_id: int,
    payload: schemas.DesignTechnicalDocumentsSchema,
    db: Session = Depends(get_db)
):
    services.save_design_technical_documents(
        db,
        design_request_id,
        payload.documents
    )
    return {"status": "documents saved"}

@router.post("/{design_request_id}/requirements")
def save_requirements(
    design_request_id: int,
    payload: schemas.DesignRequirementsSchema,
    db: Session = Depends(get_db)
):
    services.save_design_requirements(db, design_request_id, payload)
    return {"status": "saved"}


@router.post("/{design_request_id}/standards")
def save_standards(
    design_request_id: int,
    payload: schemas.DesignStandardsSchema,
    db: Session = Depends(get_db)
):
    services.save_design_standards(db, design_request_id, payload)
    return {"status": "saved"}


@router.post("/{design_request_id}/lab-selection/draft")
def save_lab_selection_draft(
    design_request_id: int,
    payload: schemas.DesignLabSelectionSchema,
    db: Session = Depends(get_db)
):
    """Save design lab selection as draft"""
    services.save_design_lab_selection_draft(db, design_request_id, payload)
    return {"status": "draft saved"}

@router.post("/{design_request_id}/submit")
def submit(
    design_request_id: int,
    payload: schemas.DesignLabSelectionSchema,
    db: Session = Depends(get_db)
):
    services.submit_design_request(db, design_request_id, payload)
    return {"status": "submitted"}


@router.get("/{design_request_id}/full")
def get_full_request(
    design_request_id: int,
    db: Session = Depends(get_db)
):
    data = services.get_full_design_request(db, design_request_id)

    if not data:
        raise HTTPException(status_code=404, detail="Design request not found")

    return data
