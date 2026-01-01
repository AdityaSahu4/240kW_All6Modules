# services.py
from sqlalchemy.orm import Session
from .models import (
    CertificationRequest,
    CertificationProductDetails,
    CertificationTechnicalDocument,
    CertificationRequirements,
    CertificationStandards,
    CertificationLabSelection
)
from .schemas import (
    CertificationProductDetailsSchema,
    CertificationTechnicalDocumentsSchema,
    CertificationRequirementsSchema,
    CertificationStandardsSchema,
    CertificationLabSelectionSchema
)

def create_certification_request(db: Session):
    req = CertificationRequest(status="submitted")
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

def save_certification_product_details(db: Session, certification_request_id: int, payload: CertificationProductDetailsSchema):
    pd = db.query(CertificationProductDetails).filter(
        CertificationProductDetails.certification_request_id == certification_request_id
    ).first()

    if not pd:
        pd = CertificationProductDetails(certification_request_id=certification_request_id)
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
    pd.preferred_date = payload.preferred_date
    pd.notes = payload.notes

    db.commit()


def save_certification_technical_documents(
    db: Session,
    certification_request_id: int,
    documents: list
):
    for doc in documents:
        td = CertificationTechnicalDocument(
            certification_request_id=certification_request_id,
            doc_type=doc.doc_type,
            file_name=doc.file_name,
            file_path=doc.file_path,
            file_size=doc.file_size or 0
        )
        db.add(td)

    db.commit()

def save_certification_requirements(db: Session, certification_request_id: int, payload: CertificationRequirementsSchema):
    req = db.query(CertificationRequirements).filter(
        CertificationRequirements.certification_request_id == certification_request_id
    ).first()

    if not req:
        req = CertificationRequirements(certification_request_id=certification_request_id)
        db.add(req)

    req.test_type = payload.test_type
    req.selected_tests = payload.selected_tests

    db.commit()

def save_certification_standards(db: Session, certification_request_id: int, payload: CertificationStandardsSchema):
    std = db.query(CertificationStandards).filter(
        CertificationStandards.certification_request_id == certification_request_id
    ).first()

    if not std:
        std = CertificationStandards(certification_request_id=certification_request_id)
        db.add(std)

    std.regions = payload.regions
    std.standards = payload.standards

    db.commit()

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
    req = db.query(CertificationRequest).filter(
        CertificationRequest.id == certification_request_id
    ).first()

    if not req:
        return None

    product = db.query(CertificationProductDetails).filter_by(
        certification_request_id=certification_request_id
    ).first()

    requirements = db.query(CertificationRequirements).filter_by(
        certification_request_id=certification_request_id
    ).first()

    standards = db.query(CertificationStandards).filter_by(
        certification_request_id=certification_request_id
    ).first()

    lab = db.query(CertificationLabSelection).filter_by(
        certification_request_id=certification_request_id
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
            "preferred_date": product.preferred_date,
            "notes": product.notes
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
        "certification_request": {
            "id": req.id,
            "status": req.status,
            "created_at": req.created_at.isoformat() if req.created_at else None
        },
        "product": product_dict,
        "requirements": requirements_dict,
        "standards": standards_dict,
        "lab": lab_dict
    }
