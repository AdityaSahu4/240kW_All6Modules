# routes.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
import os
import shutil
from core.database import get_db
from . import services, schemas
from modules.calibration_request.models import CalibrationRequest, CalibrationTechnicalDocument


router = APIRouter(prefix="/calibration-request", tags=["Calibration Request"])

# NEW: Get all calibration requests
@router.get("/")
def get_all_requests(db: Session = Depends(get_db)):
    """Get all calibration requests with their details"""
    requests = services.get_all_calibration_requests(db)
    return {"requests": requests}

# NEW: Get single calibration request with all details
@router.get("/by-id/{calibration_id}")
def get_request_by_cal_id(calibration_id: str, db: Session = Depends(get_db)):
    """Get calibration request by CAL-{id} format"""
    try:
        # Extract numeric ID from "CAL-1" format
        request_id = int(calibration_id.replace("CAL-", ""))
        data = services.get_full_calibration_request(db, request_id)
        
        if not data:
            raise HTTPException(status_code=404, detail="Calibration request not found")
        
        return data
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid calibration ID format")

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


# ✅ NEW: Update/Edit calibration request
@router.put("/{calibration_request_id}/product")
def update_product_details(
    calibration_request_id: int,
    payload: schemas.CalibrationProductDetailsSchema,
    db: Session = Depends(get_db)
):
    """Update product details for a calibration request"""
    try:
        services.save_calibration_product_details(db, calibration_request_id, payload)
        return {"status": "updated", "message": "Product details updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")


# ✅ NEW: Delete calibration request
@router.delete("/{calibration_request_id}")
def delete_calibration_request(
    calibration_request_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a calibration request and all associated data
    This includes: product details, documents (files + DB records), requirements, standards, lab selection
    """
    try:
        # Check if request exists
        req = db.query(CalibrationRequest).filter(
            CalibrationRequest.id == calibration_request_id
        ).first()

        if not req:
            raise HTTPException(status_code=404, detail="Calibration request not found")

        # Get the absolute path to the backend directory
        current_file = Path(__file__).resolve()
        backend_dir = current_file.parent.parent.parent
        
        # Delete uploaded files from filesystem
        upload_dir = backend_dir / "database" / "upload" / "calibration_requests" / str(calibration_request_id)
        if upload_dir.exists():
            shutil.rmtree(upload_dir)
            print(f"Deleted upload directory: {upload_dir}")

        # Delete all related records (SQLAlchemy will handle CASCADE if configured, otherwise manual delete)
        # The services function will handle the deletion
        services.delete_calibration_request(db, calibration_request_id)

        return {
            "status": "success",
            "message": f"Calibration request {calibration_request_id} deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete calibration request: {str(e)}")


# ✅ NEW: Delete specific document
@router.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Delete a specific document file and database record"""
    try:
        # Get document from database
        document = db.query(CalibrationTechnicalDocument).filter(
            CalibrationTechnicalDocument.id == document_id
        ).first()

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Get the absolute path to the backend directory
        current_file = Path(__file__).resolve()
        backend_dir = current_file.parent.parent.parent
        
        # Construct full file path
        file_path = backend_dir / document.file_path
        
        # Delete file from filesystem if it exists
        if file_path.exists():
            file_path.unlink()
            print(f"Deleted file: {file_path}")

        # Delete database record
        db.delete(document)
        db.commit()

        return {
            "status": "success",
            "message": f"Document {document.file_name} deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")


# Download document endpoint
@router.get("/documents/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """
    Download a specific document by its ID
    Returns the file as a downloadable attachment
    """
    # Get document from database
    document = db.query(CalibrationTechnicalDocument).filter(
        CalibrationTechnicalDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get the absolute path to the backend directory
    current_file = Path(__file__).resolve()
    backend_dir = current_file.parent.parent.parent  # Go up to backend/
    
    # Construct full file path
    file_path = backend_dir / document.file_path
    
    # Check if file exists
    if not file_path.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"File not found on server: {document.file_name}"
        )

    # Return file as download
    return FileResponse(
        path=str(file_path),
        filename=document.file_name,
        media_type='application/octet-stream',
        headers={
            "Content-Disposition": f'attachment; filename="{document.file_name}"'
        }
    )


# View/Preview document endpoint (opens in browser)
@router.get("/documents/{document_id}/view")
def view_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """
    View a specific document by its ID
    Returns the file to be displayed in browser (for PDFs, images, etc.)
    """
    # Get document from database
    document = db.query(CalibrationTechnicalDocument).filter(
        CalibrationTechnicalDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get the absolute path to the backend directory
    current_file = Path(__file__).resolve()
    backend_dir = current_file.parent.parent.parent
    
    # Construct full file path
    file_path = backend_dir / document.file_path
    
    # Check if file exists
    if not file_path.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"File not found on server: {document.file_name}"
        )

    # Determine media type based on file extension
    extension = file_path.suffix.lower()
    media_type_map = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    
    media_type = media_type_map.get(extension, 'application/octet-stream')

    # Return file for viewing (inline display)
    return FileResponse(
        path=str(file_path),
        filename=document.file_name,
        media_type=media_type,
        headers={
            "Content-Disposition": f'inline; filename="{document.file_name}"'
        }
    )


# Get document info endpoint
@router.get("/documents/{document_id}")
def get_document_info(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific document"""
    document = db.query(CalibrationTechnicalDocument).filter(
        CalibrationTechnicalDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "id": document.id,
        "calibration_request_id": document.calibration_request_id,
        "doc_type": document.doc_type,
        "file_name": document.file_name,
        "file_path": document.file_path,
        "file_size": document.file_size,
        "uploaded_at": document.created_at.isoformat() if hasattr(document, 'created_at') and document.created_at else None
    }