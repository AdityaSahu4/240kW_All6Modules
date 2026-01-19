# backend/modules/lab_request/services.py

import os
from pathlib import Path
from sqlalchemy.orm import Session

from .models import (
    LabRequest,
    LabRequestProgress,
    LabSchedule,
    LabRequestStatusLog,
    LabRequestAssignment,
    LabDocument
)
from .status_config import get_status_info, get_customer_timeline


# ✅ Helper function to sync lab changes back to calibration
def sync_to_calibration(db: Session, lab_request_id: int):
    """
    Sync lab request status and progress back to calibration request
    """
    try:
        # Import here to avoid circular imports
        from modules.calibration_request.models import CalibrationRequest
        
        # Find calibration request linked to this lab request
        calibration_req = db.query(CalibrationRequest).filter(
            CalibrationRequest.lab_request_id == lab_request_id
        ).first()
        
        if not calibration_req:
            print(f"⚠️ No calibration request found for lab request {lab_request_id}")
            return
        
        # Get lab request details
        lab_req = db.query(LabRequest).filter(
            LabRequest.id == lab_request_id
        ).first()
        
        if not lab_req:
            return
        
        # Get latest progress
        latest_progress = db.query(LabRequestProgress).filter(
            LabRequestProgress.lab_request_id == lab_request_id
        ).order_by(LabRequestProgress.updated_at.desc()).first()
        
        # Map lab status to calibration status
        status_mapping = {
            "Pending": "submitted",
            "In Progress": "in_progress",
            "Completed": "completed",
            "Rejected": "rejected",
        }
        
        new_cal_status = status_mapping.get(lab_req.status, "submitted")
        
        # Update calibration request status
        old_status = calibration_req.status
        calibration_req.status = new_cal_status
        
        db.commit()
        
        print(f"✅ Synced lab request {lab_request_id} → calibration request {calibration_req.id}")
        print(f"   Status: {old_status} → {new_cal_status}")
        print(f"   Detailed Status: {lab_req.detailed_status}")
        if latest_progress:
            print(f"   Progress: {latest_progress.progress_percent}%")
        
    except Exception as e:
        print(f"⚠️ Failed to sync to calibration: {str(e)}")
        import traceback
        traceback.print_exc()


# --------------------------------------------------------
# CREATE NEW LAB REQUEST
# --------------------------------------------------------
def create_lab_request(db: Session, product_name: str, service_type: str):
    req = LabRequest(
        product_name=product_name,
        service_type=service_type,
        status="Pending",
        detailed_status="Submitted",
        customer_message="Your calibration request has been submitted and is awaiting lab review."
    )

    db.add(req)
    db.commit()
    db.refresh(req)
    
    print(f"✅ Lab request created: ID={req.id}, Product={product_name}, Service={service_type}")
    
    return req


# --------------------------------------------------------
# GET ALL LAB REQUESTS
# --------------------------------------------------------
def get_all_lab_requests(db: Session):
    """
    Get all lab requests with enhanced information
    """
    requests = db.query(LabRequest).all()
    
    print(f"📊 Found {len(requests)} lab requests in database")
    
    result = []
    for req in requests:
        result.append({
            "id": req.id,
            "request_code": req.request_code or f"LR-{req.id}",
            "product_name": req.product_name,
            "service_type": req.service_type,
            "status": req.status,
            "detailed_status": req.detailed_status,
            "customer_message": req.customer_message,
            "created_date": req.created_date.isoformat() if req.created_date else None,
            "assigned_engineer_id": req.assigned_engineer_id
        })
    
    return result


# --------------------------------------------------------
# GET FULL LAB REQUEST DETAILS
# --------------------------------------------------------
def get_full_lab_request(db: Session, lab_request_id: int):
    req = db.query(LabRequest).filter(
        LabRequest.id == lab_request_id
    ).first()

    if not req:
        return None

    progress = db.query(LabRequestProgress).filter(
        LabRequestProgress.lab_request_id == lab_request_id
    ).all()

    schedule = db.query(LabSchedule).filter(
        LabSchedule.lab_request_id == lab_request_id
    ).all()

    logs = db.query(LabRequestStatusLog).filter(
        LabRequestStatusLog.lab_request_id == lab_request_id
    ).all()

    assignments = db.query(LabRequestAssignment).filter(
        LabRequestAssignment.lab_request_id == lab_request_id
    ).all()

    documents = db.query(LabDocument).filter(
        LabDocument.lab_request_id == lab_request_id
    ).all()

    # Return unified structured response
    return {
        "request": {
            "id": req.id,
            "product_name": req.product_name,
            "service_type": req.service_type,
            "status": req.status,
            "detailed_status": req.detailed_status,
            "customer_message": req.customer_message,
            "created_date": req.created_date.isoformat() if req.created_date else None,
            "assigned_engineer_id": req.assigned_engineer_id,
            "estimated_completion": req.estimated_completion.isoformat() if req.estimated_completion else None
        },
        "progress": [
            {
                "id": p.id,
                "progress_percent": p.progress_percent,
                "notes": p.notes,
                "updated_by": p.updated_by,
                "updated_at": p.updated_at.isoformat() if p.updated_at else None
            }
            for p in progress
        ],
        "schedule": [
            {
                "id": s.id,
                "engineer_id": s.engineer_id,
                "start_datetime": s.start_datetime.isoformat() if s.start_datetime else None,
                "end_datetime": s.end_datetime.isoformat() if s.end_datetime else None,
                "schedule_status": s.schedule_status
            }
            for s in schedule
        ],
        "status_logs": [
            {
                "id": l.id,
                "previous_status": l.previous_status,
                "current_status": l.current_status,
                "previous_detailed_status": getattr(l, 'previous_detailed_status', None),
                "current_detailed_status": getattr(l, 'current_detailed_status', None),
                "changed_by": l.changed_by,
                "changed_at": l.changed_at.isoformat() if l.changed_at else None,
                "notes": getattr(l, 'notes', None)
            }
            for l in logs
        ],
        "assignments": [
            {
                "id": a.id,
                "engineer_id": a.engineer_id,
                "assigned_by": a.assigned_by,
                "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None
            }
            for a in assignments
        ],
        "documents": [
            {
                "id": d.id,
                "document_type": d.document_type,
                "file_name": d.file_name,
                "file_path": d.file_path,
                "file_size": d.file_size,
                "uploaded_by": d.uploaded_by,
                "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None
            }
            for d in documents
        ]
    }


# --------------------------------------------------------
# UPDATE DETAILED STATUS
# --------------------------------------------------------
def update_lab_request_detailed_status(
    db: Session,
    lab_request_id: int,
    detailed_status: str,
    reason: str = None,
    updated_by: str = "system"
):
    """
    Update detailed status with customer message
    """
    req = db.query(LabRequest).filter(
        LabRequest.id == lab_request_id
    ).first()
    
    if not req:
        return None
    
    # Get latest progress for dynamic message
    latest_progress = db.query(LabRequestProgress).filter(
        LabRequestProgress.lab_request_id == lab_request_id
    ).order_by(LabRequestProgress.updated_at.desc()).first()
    
    test_progress = latest_progress.progress_percent if latest_progress else None
    
    # Get status info
    status_info = get_status_info(
        detailed_status,
        test_progress=test_progress,
        reason=reason
    )
    
    # Log status change
    log = LabRequestStatusLog(
        lab_request_id=lab_request_id,
        previous_status=req.status,
        current_status=req.status,
        previous_detailed_status=req.detailed_status,
        current_detailed_status=detailed_status,
        changed_by=updated_by,
        notes=reason
    )
    
    # Update request
    req.detailed_status = detailed_status
    req.customer_message = status_info["message"]
    
    db.add(log)
    db.commit()
    db.refresh(req)
    
    print(f"✅ Updated detailed status to: {detailed_status}")
    print(f"   Customer message: {status_info['message']}")
    
    # Sync to calibration
    sync_to_calibration(db, lab_request_id)
    
    return req


# --------------------------------------------------------
# UPDATE STATUS + WRITE STATUS LOG + SYNC TO CALIBRATION
# --------------------------------------------------------
def update_lab_request_status(db: Session, lab_request_id: int, new_status: str, changed_by: str):
    req = db.query(LabRequest).filter(
        LabRequest.id == lab_request_id
    ).first()

    if not req:
        return None

    log = LabRequestStatusLog(
        lab_request_id=lab_request_id,
        previous_status=req.status,
        current_status=new_status,
        previous_detailed_status=req.detailed_status,
        current_detailed_status=req.detailed_status,
        changed_by=changed_by
    )

    req.status = new_status
    
    # Auto-update detailed status based on high-level status
    detailed_status_map = {
        "Pending": "Submitted",
        "In Progress": "Testing Started",
        "Completed": "Completed",
        "Rejected": "Rejected by Lab"
    }
    
    if new_status in detailed_status_map:
        new_detailed = detailed_status_map[new_status]
        status_info = get_status_info(new_detailed)
        req.detailed_status = new_detailed
        req.customer_message = status_info["message"]

    db.add(log)
    db.commit()
    
    # ✅ Sync status change to calibration
    sync_to_calibration(db, lab_request_id)
    
    return req


# --------------------------------------------------------
# ADD PROGRESS UPDATE + SYNC TO CALIBRATION
# --------------------------------------------------------
def add_lab_progress(db: Session, lab_request_id: int, percent: int, notes: str, updated_by: str):
    progress = LabRequestProgress(
        lab_request_id=lab_request_id,
        progress_percent=percent,
        notes=notes,
        updated_by=updated_by
    )

    db.add(progress)
    db.commit()
    
    # Update request's detailed status message if in progress
    req = db.query(LabRequest).filter(LabRequest.id == lab_request_id).first()
    if req and req.detailed_status == "In Progress":
        status_info = get_status_info("In Progress", test_progress=percent)
        req.customer_message = status_info["message"]
        db.commit()
    
    # ✅ Sync progress to calibration
    sync_to_calibration(db, lab_request_id)
    
    return progress


# --------------------------------------------------------
# ASSIGN / REASSIGN ENGINEER + LOG ENTRY + SYNC
# --------------------------------------------------------
def assign_lab_engineer(db: Session, lab_request_id: int, engineer_id: int, assigned_by: str):
    req = db.query(LabRequest).filter(
        LabRequest.id == lab_request_id
    ).first()

    if not req:
        return None

    log = LabRequestAssignment(
        lab_request_id=lab_request_id,
        engineer_id=engineer_id,
        assigned_by=assigned_by
    )

    req.assigned_engineer_id = engineer_id
    
    # Auto-change status to "In Progress" when assigned
    if req.status == "Pending":
        req.status = "In Progress"
        req.detailed_status = "Testing Started"
        status_info = get_status_info("Testing Started")
        req.customer_message = status_info["message"]

    db.add(log)
    db.commit()
    
    # ✅ Sync assignment to calibration
    sync_to_calibration(db, lab_request_id)
    
    return log


# --------------------------------------------------------
# CREATE SCHEDULE ENTRY
# --------------------------------------------------------
def create_lab_schedule(db: Session, lab_request_id: int, engineer_id: int, start, end, status):
    sched = LabSchedule(
        lab_request_id=lab_request_id,
        engineer_id=engineer_id,
        start_datetime=start,
        end_datetime=end,
        schedule_status=status
    )

    db.add(sched)
    db.commit()
    return sched


# --------------------------------------------------------
# DOCUMENT UPLOAD HANDLER
# --------------------------------------------------------
def upload_lab_documents(db: Session, lab_request_id: int, files, doc_types, uploaded_by: str):
    saved = []

    current_file = Path(__file__).resolve()
    backend_dir = current_file.parent.parent.parent
    upload_dir = backend_dir / "database" / "upload" / "lab_requests" / str(lab_request_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    for file, doc_type in zip(files, doc_types):
        filename = file.filename
        file_path = upload_dir / filename

        # Save file to disk
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())

        relative_path = str(file_path.relative_to(backend_dir)).replace("\\", "/")

        doc = LabDocument(
            lab_request_id=lab_request_id,
            document_type=doc_type,
            file_name=filename,
            file_path=relative_path,
            file_size=os.path.getsize(file_path),
            uploaded_by=uploaded_by
        )

        db.add(doc)
        saved.append(doc)

    db.commit()
    return saved


# --------------------------------------------------------
# DELETE A DOCUMENT
# --------------------------------------------------------
def delete_lab_document(db: Session, document_id: int):
    doc = db.query(LabDocument).filter(
        LabDocument.id == document_id
    ).first()

    if not doc:
        return False

    db.delete(doc)
    db.commit()
    return True