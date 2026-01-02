# services.py
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
from .models import (
    CertificationRequest,
    CertificationTechnicalDocument,
    CertificationLabSelection
)
from .schemas import (
    CertificationDetailsSchema,
    CertificationLabSelectionSchema
)

def create_certification_request(db: Session):
    req = CertificationRequest(status="draft")
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

def save_certification_details(db: Session, certification_request_id: int, payload: CertificationDetailsSchema):
    req = db.query(CertificationRequest).filter(
        CertificationRequest.id == certification_request_id
    ).first()

    if not req:
        raise ValueError("CertificationRequest not found")

    req.target_region = payload.target_region
    req.product_name = payload.product_name
    req.product_category = payload.product_category
    req.standards = payload.standards
    req.estimated_fee_range = payload.estimated_fee_range
    req.additional_notes = payload.additional_notes

    db.commit()
    db.refresh(req)
    return req

def save_certification_uploaded_files(db: Session, certification_request_id: int, files: list, doc_types: list):
    if len(files) != len(doc_types):
        raise ValueError("Number of files and doc_types must match")

    current_file = Path(__file__).resolve()
    backend_dir = current_file.parent.parent.parent

    base_upload_dir = backend_dir / "database" / "upload" / "certification_requests"
    request_upload_dir = base_upload_dir / str(certification_request_id)
    request_upload_dir.mkdir(parents=True, exist_ok=True)

    saved_files = []

    for index, (file, doc_type) in enumerate(zip(files, doc_types)):
        original_filename = Path(file.filename).name
        safe_filename = f"{doc_type}_{original_filename}"
        file_path = request_upload_dir / safe_filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = file_path.stat().st_size
        relative_path = str(file_path.relative_to(backend_dir)).replace("\\", "/")

        td = CertificationTechnicalDocument(
            certification_request_id=certification_request_id,
            doc_type=doc_type,
            file_name=original_filename,
            file_path=relative_path,
            file_size=file_size,
            display_order=index
        )

        db.add(td)

        saved_files.append({
            "doc_type": doc_type,
            "file_name": original_filename,
            "file_path": relative_path,
            "file_size": file_size,
            "display_order": index
        })

    db.commit()
    return saved_files

def save_certification_lab_selection_draft(db: Session, certification_request_id: int, payload: CertificationLabSelectionSchema):
    """Save lab selection as draft without changing request status"""
    req = db.query(CertificationRequest).filter(
        CertificationRequest.id == certification_request_id
    ).first()

    if not req:
        raise ValueError("CertificationRequest not found")

    lab = db.query(CertificationLabSelection).filter(
        CertificationLabSelection.certification_request_id == certification_request_id
    ).first()

    if lab:
        lab.selected_labs = payload.selected_labs
        if payload.region:
            lab.region = payload.region
        lab.remarks = payload.remarks
    else:
        lab = CertificationLabSelection(
            certification_request_id=certification_request_id,
            selected_labs=payload.selected_labs,
            region=payload.region if payload.region else None,
            remarks=payload.remarks
        )
        db.add(lab)

    db.commit()
    db.refresh(lab)
    return lab

def submit_certification_request(db: Session, certification_request_id: int, payload: CertificationLabSelectionSchema):
    req = db.query(CertificationRequest).filter(
        CertificationRequest.id == certification_request_id
    ).first()

    if not req:
        raise ValueError("CertificationRequest not found")

    lab = db.query(CertificationLabSelection).filter(
        CertificationLabSelection.certification_request_id == certification_request_id
    ).first()

    if lab:
        lab.selected_labs = payload.selected_labs
        if payload.region:
            lab.region = payload.region
        lab.remarks = payload.remarks
    else:
        lab = CertificationLabSelection(
            certification_request_id=certification_request_id,
            selected_labs=payload.selected_labs,
            region=payload.region if payload.region else None,
            remarks=payload.remarks
        )
        db.add(lab)

    req.status = "submitted"
    db.commit()

def get_full_certification_request(db: Session, certification_request_id: int):
    req = db.query(CertificationRequest).filter_by(
        id=certification_request_id
    ).first()

    if not req:
        return None

    docs = db.query(CertificationTechnicalDocument).filter_by(
        certification_request_id=certification_request_id
    ).order_by(CertificationTechnicalDocument.display_order).all()

    lab = db.query(CertificationLabSelection).filter_by(
        certification_request_id=certification_request_id
    ).first()

    documents_list = []
    for doc in docs:
        documents_list.append({
            "id": doc.id,
            "doc_type": doc.doc_type,
            "file_name": doc.file_name,
            "file_path": doc.file_path,
            "file_size": doc.file_size,
            "display_order": doc.display_order
        })

    lab_dict = None
    if lab:
        lab_dict = {
            "id": lab.id,
            "selected_labs": lab.selected_labs or [],
            "region": lab.region,
            "remarks": lab.remarks
        }

    return {
        "certification_request": {
            "id": req.id,
            "status": req.status,
            "target_region": req.target_region,
            "product_name": req.product_name,
            "product_category": req.product_category,
            "standards": req.standards or [],
            "estimated_fee_range": req.estimated_fee_range,
            "additional_notes": req.additional_notes,
            "created_at": req.created_at.isoformat() if req.created_at else None
        },
        "documents": documents_list,
        "lab": lab_dict
    }

def cleanup_old_drafts(db: Session, keep_latest: int = 1):
    drafts = db.query(CertificationRequest).filter(
        CertificationRequest.status == "draft"
    ).order_by(CertificationRequest.created_at.desc()).all()
    
    deleted_count = 0
    
    if len(drafts) > keep_latest:
        to_delete = drafts[keep_latest:]
        for draft in to_delete:
            docs = db.query(CertificationTechnicalDocument).filter(
                CertificationTechnicalDocument.certification_request_id == draft.id
            ).all()
            
            for doc in docs:
                try:
                    file_path = Path(doc.file_path)
                    if file_path.exists():
                        file_path.unlink()
                except Exception as e:
                    print(f"Failed to delete file {doc.file_path}: {e}")
            
            db.delete(draft)
            deleted_count += 1
        
        db.commit()
    
    return deleted_count