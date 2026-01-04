# services.py
import os
from pathlib import Path
from sqlalchemy.orm import Session
from .models import (
    DesignRequest,
    DesignProductDetails,
    DesignTechnicalDocument,
    DesignRequirements,
    DesignStandards,
    DesignLabSelection
)
from .schemas import (
    DesignProductDetailsSchema,
    DesignTechnicalDocumentsSchema,
    DesignRequirementsSchema,
    DesignStandardsSchema,
    DesignLabSelectionSchema
)

def create_design_request(db: Session):
    dr = DesignRequest(status="submitted")
    db.add(dr)
    db.commit()
    db.refresh(dr)
    return dr

def save_draft(db, design_request_id: int):
    dr = db.query(DesignRequest).filter(
        DesignRequest.id == design_request_id
    ).first()

    if not dr:
        raise ValueError("DesignRequest not found")

    dr.status = "draft"
    db.commit()


def save_design_product_details(db: Session, design_request_id: int, payload: DesignProductDetailsSchema):
    pd = db.query(DesignProductDetails).filter(
        DesignProductDetails.design_request_id == design_request_id
    ).first()

    if not pd:
        pd = DesignProductDetails(design_request_id=design_request_id)
        db.add(pd)

    pd.eut_name = payload.eut_name
    pd.eut_quantity = payload.eut_quantity
    pd.manufacturer = payload.manufacturer
    pd.model_no = payload.model_no
    pd.serial_no = payload.serial_no
    pd.supply_voltage = payload.supply_voltage
    pd.operating_frequency = payload.operating_frequency
    pd.current = payload.current
    pd.weight = payload.weight

    pd.length_mm = payload.dimensions.length
    pd.width_mm = payload.dimensions.width
    pd.height_mm = payload.dimensions.height

    pd.power_ports = payload.power_ports
    pd.signal_lines = payload.signal_lines
    pd.software_name = payload.software_name
    pd.software_version = payload.software_version

    pd.industry = payload.industry
    pd.industry_other = payload.industry_other
    # pd.preferred_date = payload.preferred_date
    # pd.notes = payload.notes

    db.commit()


def save_design_technical_documents(
    db: Session,
    design_request_id: int,
    documents: list
):
    for doc in documents:
        td = DesignTechnicalDocument(
            design_request_id=design_request_id,
            doc_type=doc.doc_type,
            file_name=doc.file_name,
            file_path=doc.file_path,
            file_size=doc.file_size or 0
        )
        db.add(td)

    db.commit()

def save_design_uploaded_files(
    db: Session,
    design_request_id: int,
    files: list,
    doc_types: list
):
    """
    Save uploaded files to backend/database/upload/design_requests/{request_id}/
    and store file metadata in database
    """
    # Get the absolute path to the backend directory
    current_file = Path(__file__).resolve()
    backend_dir = current_file.parent.parent.parent  # Go up to backend/
    
    # Create upload directory if it doesn't exist
    base_upload_dir = backend_dir / "database" / "upload" / "design_requests"
    request_upload_dir = base_upload_dir / str(design_request_id)
    request_upload_dir.mkdir(parents=True, exist_ok=True)
    
    saved_files = []
    
    for file, doc_type in zip(files, doc_types):
        # Generate unique filename to prevent conflicts
        original_filename = file.filename
        file_extension = Path(original_filename).suffix
        
        # Create a safe filename: {doc_type}_{original_name}
        safe_filename = f"{doc_type}_{original_filename}"
        file_path = request_upload_dir / safe_filename
        
        # Save the file
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        # Store relative path in database (relative to backend/)
        relative_path = str(file_path.relative_to(backend_dir)).replace("\\", "/")
        
        # Create database record
        td = DesignTechnicalDocument(
            design_request_id=design_request_id,
            doc_type=doc_type,
            file_name=original_filename,
            file_path=relative_path,
            file_size=len(content)
        )
        db.add(td)
        saved_files.append({
            "doc_type": doc_type,
            "file_name": original_filename,
            "file_path": relative_path,
            "file_size": len(content)
        })
    
    db.commit()
    return saved_files

def save_design_requirements(db: Session, design_request_id: int, payload: DesignRequirementsSchema):
    dr = db.query(DesignRequirements).filter(
        DesignRequirements.design_request_id == design_request_id
    ).first()

    if not dr:
        dr = DesignRequirements(design_request_id=design_request_id)
        db.add(dr)

    dr.test_type = payload.test_type
    dr.selected_tests = payload.selected_tests

    db.commit()

def save_design_standards(db: Session, design_request_id: int, payload: DesignStandardsSchema):
    ds = db.query(DesignStandards).filter(
        DesignStandards.design_request_id == design_request_id
    ).first()

    if not ds:
        ds = DesignStandards(design_request_id=design_request_id)
        db.add(ds)

    ds.regions = payload.regions
    ds.standards = payload.standards

    db.commit()

def save_design_lab_selection_draft(db: Session, design_request_id: int, payload: DesignLabSelectionSchema):
    """Save design lab selection as draft without changing request status"""
    dr = db.query(DesignRequest).filter(
        DesignRequest.id == design_request_id
    ).first()

    if not dr:
        raise ValueError("DesignRequest not found")

    lab = db.query(DesignLabSelection).filter(
        DesignLabSelection.design_request_id == design_request_id
    ).first()

    if lab:
        lab.selected_labs = payload.selected_labs
        # Only update region if it's provided and not empty
        if payload.region:
            lab.region = payload.region
        lab.remarks = payload.remarks
    else:
        lab = DesignLabSelection(
            design_request_id=design_request_id,
            selected_labs=payload.selected_labs,
            region=payload.region if payload.region else None,
            remarks=payload.remarks
        )
        db.add(lab)

    db.commit()
    db.refresh(lab)
    return lab

def submit_design_request(db: Session, design_request_id: int, payload: DesignLabSelectionSchema):
    dr = db.query(DesignRequest).filter(
        DesignRequest.id == design_request_id
    ).first()

    if not dr:
        raise ValueError("DesignRequest not found")

    lab = db.query(DesignLabSelection).filter(
        DesignLabSelection.design_request_id == design_request_id
    ).first()

    if lab:
        lab.selected_labs = payload.selected_labs
        # Only update region if it's provided and not empty
        if payload.region:
            lab.region = payload.region
        lab.remarks = payload.remarks
    else:
        lab = DesignLabSelection(
            design_request_id=design_request_id,
            selected_labs=payload.selected_labs,
            region=payload.region if payload.region else None,
            remarks=payload.remarks
        )
        db.add(lab)

    dr.status = "submitted"
    db.commit()

def get_full_design_request(db: Session, design_request_id: int):
    dr = db.query(DesignRequest).filter(
        DesignRequest.id == design_request_id
    ).first()

    if not dr:
        return None

    product = db.query(DesignProductDetails).filter_by(
        design_request_id=design_request_id
    ).first()

    requirements = db.query(DesignRequirements).filter_by(
        design_request_id=design_request_id
    ).first()

    standards = db.query(DesignStandards).filter_by(
        design_request_id=design_request_id
    ).first()

    lab = db.query(DesignLabSelection).filter_by(
        design_request_id=design_request_id
    ).first()

    # Convert SQLAlchemy objects to dictionaries for proper JSON serialization
    product_dict = None
    if product:
        product_dict = {
            "id": product.id,
            "eut_name": product.eut_name,
            "eut_quantity": product.eut_quantity,
            "manufacturer": product.manufacturer,
            "model_no": product.model_no,
            "serial_no": product.serial_no,
            "supply_voltage": product.supply_voltage,
            "operating_frequency": product.operating_frequency,
            "current": product.current,
            "weight": product.weight,
            "length_mm": product.length_mm,
            "width_mm": product.width_mm,
            "height_mm": product.height_mm,
            "power_ports": product.power_ports,
            "signal_lines": product.signal_lines,
            "software_name": product.software_name,
            "software_version": product.software_version,
            "industry": product.industry,
            "industry_other": product.industry_other,
            # "preferred_date": product.preferred_date,
            # "notes": product.notes
        }

    requirements_dict = None
    if requirements:
        requirements_dict = {
            "id": requirements.id,
            "test_type": requirements.test_type,
            "selected_tests": requirements.selected_tests or []
        }

    standards_dict = None
    if standards:
        standards_dict = {
            "id": standards.id,
            "regions": standards.regions or [],
            "standards": standards.standards or []
        }

    lab_dict = None
    if lab:
        lab_dict = {
            "id": lab.id,
            "selected_labs": lab.selected_labs or [],
            "region": lab.region,
            "remarks": lab.remarks
        }

    return {
        "design_request": {
            "id": dr.id,
            "status": dr.status,
            "created_at": dr.created_at.isoformat() if dr.created_at else None
        },
        "product": product_dict,
        "requirements": requirements_dict,
        "standards": standards_dict,
        "lab": lab_dict
    }

