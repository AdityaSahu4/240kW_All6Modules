# backend/modules/calibration_request/services.py

import os
import json
from pathlib import Path
from sqlalchemy.orm import Session
from .models import (
    CalibrationRequest,
    CalibrationProductDetails,
    CalibrationTechnicalDocument,
    CalibrationRequirements,
    CalibrationStandards,
    CalibrationLabSelection,
    CalibrationConfirmation,
    CalibrationApproval
)
from .schemas import (
    CalibrationProductDetailsSchema,
    CalibrationTechnicalDocumentsSchema,
    CalibrationRequirementsSchema,
    CalibrationStandardsSchema,
    CalibrationLabSelectionSchema,
    CalibrationConfirmationSchema,
    CalibrationApprovalSchema
)

# ✅ Import lab_request services
from modules.lab_request.services import create_lab_request as create_lab_request_entry

def create_calibration_request(db: Session):
    req = CalibrationRequest(status="draft")
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

def get_all_calibration_requests(db: Session):
    """Get all SUBMITTED calibration requests with live lab progress and detailed status"""
    from modules.lab_request.models import LabRequest, LabRequestProgress
    
    # ✅ Get submitted calibration requests
    requests = db.query(CalibrationRequest).filter(
        CalibrationRequest.status.in_(["submitted", "in_progress", "completed"])
    ).all()
    
    result = []
    for req in requests:
        # Get product details
        product = db.query(CalibrationProductDetails).filter_by(
            calibration_request_id=req.id
        ).first()
        
        # Get requirements
        requirements = db.query(CalibrationRequirements).filter_by(
            calibration_request_id=req.id
        ).first()
        
        # Get standards
        standards = db.query(CalibrationStandards).filter_by(
            calibration_request_id=req.id
        ).first()
        
        # Get lab selection
        lab = db.query(CalibrationLabSelection).filter_by(
            calibration_request_id=req.id
        ).first()
        
        # ✅ Get lab progress and detailed status if linked
        lab_progress = 0
        lab_status = req.status
        detailed_status = "Submitted"
        customer_message = "Your request has been submitted."
        action_required = False
        
        if req.lab_request_id:
            try:
                # Get lab request
                lab_req = db.query(LabRequest).filter_by(id=req.lab_request_id).first()
                
                if lab_req:
                    lab_status = lab_req.status
                    detailed_status = lab_req.detailed_status or "Submitted"
                    customer_message = lab_req.customer_message or "Processing your request..."
                    
                    # Get latest progress
                    latest_progress = db.query(LabRequestProgress).filter_by(
                        lab_request_id=req.lab_request_id
                    ).order_by(LabRequestProgress.updated_at.desc()).first()
                    
                    if latest_progress:
                        lab_progress = latest_progress.progress_percent
                    
                    # Check if action required based on detailed status
                    action_statuses = ["Quote Sent", "Awaiting Sample", "Report Ready"]
                    action_required = detailed_status in action_statuses
                    
            except Exception as e:
                print(f"Warning: Could not fetch lab progress: {e}")
        
        # ✅ Calculate progress based on completion + lab progress
        progress = 0
        if product:
            progress += 20
        if requirements:
            progress += 20
        if standards:
            progress += 20
        if lab:
            progress += 20
        
        # Add lab progress (0-20%)
        if lab_progress > 0:
            progress += int((lab_progress / 100) * 20)
        
        # Cap at 100%
        progress = min(progress, 100)
        
        # ✅ Better status mapping with detailed status
        status_display_map = {
            # Pre-testing
            "Submitted": "Submitted",
            "Under Review": "Under Review",
            "Quote Preparation": "Quote Pending",
            "Quote Sent": "Quote Sent",
            "Quote Approved": "Approved",
            "Quote Rejected": "Quote Declined",
            
            # Preparation
            "Scheduled": "Scheduled",
            "Awaiting Sample": "Awaiting Sample",
            "Sample Received": "Sample Received",
            
            # Testing
            "Testing Started": "Testing",
            "In Progress": "Testing",
            
            # Post-testing
            "Tests Complete": "Tests Complete",
            "Report Review": "Report Review",
            "Report Ready": "Report Ready",
            
            # Final
            "Completed": "Complete",
            "Certificate Issued": "Complete",
            
            # Stopped
            "Rejected by Lab": "Rejected",
            "Cancelled": "Cancelled",
            "On Hold": "On Hold"
        }
        
        display_status = status_display_map.get(detailed_status, "Testing")
        
        result.append({
            "id": f"CAL-{req.id}",
            "name": product.eut_name if product else f"Calibration Request #{req.id}",
            "service": "Calibration",
            "status": display_status,
            "detailedStatus": detailed_status,
            "customerMessage": customer_message,
            "actionRequired": action_required,
            "progress": progress,
            "createdAt": req.created_at.isoformat() if req.created_at else None,
            "testType": requirements.test_type if requirements else None,
            "manufacturer": product.manufacturer if product else None,
            "modelNo": product.model_no if product else None,
            "labRequestId": req.lab_request_id,
        })
    
    return result

def save_calibration_product_details(db: Session, calibration_request_id: int, payload: CalibrationProductDetailsSchema):
    pd = db.query(CalibrationProductDetails).filter(
        CalibrationProductDetails.calibration_request_id == calibration_request_id
    ).first()

    if not pd:
        pd = CalibrationProductDetails(calibration_request_id=calibration_request_id)
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

    if isinstance(payload.industry, list):
        pd.industry = json.dumps(payload.industry)
    else:
        pd.industry = payload.industry
    
    pd.industry_other = payload.industry_other
    pd.preferred_date = payload.preferred_date
    pd.notes = payload.notes

    db.commit()


def save_calibration_technical_documents(
    db: Session,
    calibration_request_id: int,
    documents: list
):
    for doc in documents:
        td = CalibrationTechnicalDocument(
            calibration_request_id=calibration_request_id,
            doc_type=doc.doc_type,
            file_name=doc.file_name,
            file_path=doc.file_path,
            file_size=doc.file_size or 0
        )
        db.add(td)

    db.commit()

def save_calibration_uploaded_files(
    db: Session,
    calibration_request_id: int,
    files: list,
    doc_types: list
):
    """
    Save uploaded files to backend/database/upload/calibration_requests/{request_id}/
    and store file metadata in database
    """
    current_file = Path(__file__).resolve()
    backend_dir = current_file.parent.parent.parent
    
    base_upload_dir = backend_dir / "database" / "upload" / "calibration_requests"
    request_upload_dir = base_upload_dir / str(calibration_request_id)
    request_upload_dir.mkdir(parents=True, exist_ok=True)
    
    saved_files = []
    
    for file, doc_type in zip(files, doc_types):
        original_filename = file.filename
        file_extension = Path(original_filename).suffix
        
        safe_filename = f"{doc_type}_{original_filename}"
        file_path = request_upload_dir / safe_filename
        
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        relative_path = str(file_path.relative_to(backend_dir)).replace("\\", "/")
        
        td = CalibrationTechnicalDocument(
            calibration_request_id=calibration_request_id,
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

def save_calibration_requirements(db: Session, calibration_request_id: int, payload: CalibrationRequirementsSchema):
    req = db.query(CalibrationRequirements).filter(
        CalibrationRequirements.calibration_request_id == calibration_request_id
    ).first()

    if not req:
        req = CalibrationRequirements(calibration_request_id=calibration_request_id)
        db.add(req)

    req.test_type = payload.test_type
    req.selected_tests = payload.selected_tests

    db.commit()

def save_calibration_standards(db: Session, calibration_request_id: int, payload: CalibrationStandardsSchema):
    std = db.query(CalibrationStandards).filter(
        CalibrationStandards.calibration_request_id == calibration_request_id
    ).first()

    if not std:
        std = CalibrationStandards(calibration_request_id=calibration_request_id)
        db.add(std)

    std.regions = payload.regions
    std.standards = payload.standards

    db.commit()

def save_calibration_confirmation(db: Session, calibration_request_id: int, payload: CalibrationConfirmationSchema):
    """Save calibration confirmation checkboxes from details page"""
    conf = db.query(CalibrationConfirmation).filter(
        CalibrationConfirmation.calibration_request_id == calibration_request_id
    ).first()

    if not conf:
        conf = CalibrationConfirmation(calibration_request_id=calibration_request_id)
        db.add(conf)

    conf.approve_plan = str(payload.approve_plan).lower()
    conf.understand_tests = str(payload.understand_tests).lower()

    db.commit()
    db.refresh(conf)
    return conf


def save_calibration_lab_selection_draft(db: Session, calibration_request_id: int, payload: CalibrationLabSelectionSchema):
    """Save lab selection as draft without changing request status"""
    req = db.query(CalibrationRequest).filter(
        CalibrationRequest.id == calibration_request_id
    ).first()

    if not req:
        raise ValueError("CalibrationRequest not found")

    lab = db.query(CalibrationLabSelection).filter(
        CalibrationLabSelection.calibration_request_id == calibration_request_id
    ).first()

    if lab:
        lab.selected_labs = payload.selected_labs
        if payload.region:
            lab.region = payload.region
        lab.remarks = payload.remarks
    else:
        lab = CalibrationLabSelection(
            calibration_request_id=calibration_request_id,
            selected_labs=payload.selected_labs,
            region=payload.region if payload.region else None,
            remarks=payload.remarks
        )
        db.add(lab)

    db.commit()
    db.refresh(lab)
    return lab

def submit_calibration_request(db: Session, calibration_request_id: int, payload: CalibrationLabSelectionSchema):
    """
    Submit the calibration request - changes status from 'draft' to 'submitted'
    ✅ Also creates a lab request entry automatically
    """
    req = db.query(CalibrationRequest).filter(
        CalibrationRequest.id == calibration_request_id
    ).first()

    if not req:
        raise ValueError("CalibrationRequest not found")

    lab = db.query(CalibrationLabSelection).filter(
        CalibrationLabSelection.calibration_request_id == calibration_request_id
    ).first()

    if lab:
        lab.selected_labs = payload.selected_labs
        if payload.region:
            lab.region = payload.region
        lab.remarks = payload.remarks
    else:
        lab = CalibrationLabSelection(
            calibration_request_id=calibration_request_id,
            selected_labs=payload.selected_labs,
            region=payload.region if payload.region else None,
            remarks=payload.remarks
        )
        db.add(lab)

    # Get product details for lab request
    product = db.query(CalibrationProductDetails).filter_by(
        calibration_request_id=calibration_request_id
    ).first()

    # Update calibration request status
    req.status = "submitted"
    db.commit()

    # ✅ Create lab request automatically
    try:
        product_name = product.eut_name if product else f"Calibration Request #{calibration_request_id}"
        
        lab_request = create_lab_request_entry(
            db=db,
            product_name=product_name,
            service_type="Calibration"
        )
        
        print(f"✅ Created lab request {lab_request.id} for calibration request {calibration_request_id}")
        
        req.lab_request_id = lab_request.id
        db.commit()
        
        print(f"✅ Linked calibration request {calibration_request_id} to lab request {lab_request.id}")
        
    except Exception as e:
        print(f"⚠️ Warning: Failed to create lab request: {str(e)}")
        import traceback
        traceback.print_exc()

    return req

def save_calibration_approval(db: Session, calibration_request_id: int, payload: CalibrationApprovalSchema):
    """Save calibration approval checkboxes from review page"""
    approval = db.query(CalibrationApproval).filter(
        CalibrationApproval.calibration_request_id == calibration_request_id
    ).first()

    if not approval:
        approval = CalibrationApproval(calibration_request_id=calibration_request_id)
        db.add(approval)

    approval.confirm_accurate = str(payload.confirm_accurate).lower()
    approval.confirm_approve = str(payload.confirm_approve).lower()
    approval.confirm_understand = str(payload.confirm_understand).lower()

    db.commit()
    db.refresh(approval)
    return approval

def get_full_calibration_request(db: Session, calibration_request_id: int):
    """
    Get complete calibration request details including documents and lab progress
    """
    req = db.query(CalibrationRequest).filter(
        CalibrationRequest.id == calibration_request_id
    ).first()

    if not req:
        return None

    # Get product details
    product = db.query(CalibrationProductDetails).filter_by(
        calibration_request_id=calibration_request_id
    ).first()

    # Get requirements
    requirements = db.query(CalibrationRequirements).filter_by(
        calibration_request_id=calibration_request_id
    ).first()

    # Get standards
    standards = db.query(CalibrationStandards).filter_by(
        calibration_request_id=calibration_request_id
    ).first()

    # Get lab selection
    lab = db.query(CalibrationLabSelection).filter_by(
        calibration_request_id=calibration_request_id
    ).first()

    # Get uploaded documents
    documents = db.query(CalibrationTechnicalDocument).filter_by(
        calibration_request_id=calibration_request_id
    ).all()
    
    # ✅ Get lab progress if available
    lab_progress_data = []
    detailed_status = None
    customer_message = None
    
    if req.lab_request_id:
        try:
            from modules.lab_request.models import LabRequestProgress, LabRequest
            
            lab_req = db.query(LabRequest).filter_by(id=req.lab_request_id).first()
            if lab_req:
                detailed_status = lab_req.detailed_status
                customer_message = lab_req.customer_message
            
            lab_progress = db.query(LabRequestProgress).filter_by(
                lab_request_id=req.lab_request_id
            ).order_by(LabRequestProgress.updated_at.desc()).all()
            
            lab_progress_data = [
                {
                    "progress_percent": p.progress_percent,
                    "notes": p.notes,
                    "updated_by": p.updated_by,
                    "updated_at": p.updated_at.isoformat() if p.updated_at else None
                }
                for p in lab_progress
            ]
        except Exception as e:
            print(f"Warning: Could not fetch lab progress: {e}")

    # Convert SQLAlchemy objects to dictionaries
    product_dict = None
    if product:
        industry_value = product.industry
        if industry_value and isinstance(industry_value, str) and industry_value.startswith('['):
            try:
                industry_value = json.loads(industry_value)
            except json.JSONDecodeError:
                pass
        
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
            "industry": industry_value,
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

    documents_list = []
    if documents:
        for doc in documents:
            documents_list.append({
                "id": doc.id,
                "doc_type": doc.doc_type,
                "file_name": doc.file_name,
                "file_path": doc.file_path,
                "file_size": doc.file_size,
                "uploaded_at": doc.created_at.isoformat() if hasattr(doc, 'created_at') and doc.created_at else None
            })

    return {
        "calibration_request": {
            "id": req.id,
            "status": req.status,
            "created_at": req.created_at.isoformat() if req.created_at else None,
            "lab_request_id": req.lab_request_id,
            "detailed_status": detailed_status,
            "customer_message": customer_message
        },
        "product": product_dict,
        "requirements": requirements_dict,
        "standards": standards_dict,
        "lab": lab_dict,
        "documents": documents_list,
        "lab_progress": lab_progress_data
    }


def delete_calibration_request(db: Session, calibration_request_id: int):
    """
    Delete calibration request and all associated records
    """
    # Delete in order to respect foreign key constraints
    
    db.query(CalibrationTechnicalDocument).filter(
        CalibrationTechnicalDocument.calibration_request_id == calibration_request_id
    ).delete()
    
    db.query(CalibrationProductDetails).filter(
        CalibrationProductDetails.calibration_request_id == calibration_request_id
    ).delete()
    
    db.query(CalibrationRequirements).filter(
        CalibrationRequirements.calibration_request_id == calibration_request_id
    ).delete()
    
    db.query(CalibrationStandards).filter(
        CalibrationStandards.calibration_request_id == calibration_request_id
    ).delete()
    
    db.query(CalibrationLabSelection).filter(
        CalibrationLabSelection.calibration_request_id == calibration_request_id
    ).delete()
    
    db.query(CalibrationConfirmation).filter(
        CalibrationConfirmation.calibration_request_id == calibration_request_id
    ).delete()
    
    db.query(CalibrationApproval).filter(
        CalibrationApproval.calibration_request_id == calibration_request_id
    ).delete()
    
    db.query(CalibrationRequest).filter(
        CalibrationRequest.id == calibration_request_id
    ).delete()
    
    db.commit()