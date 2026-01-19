# backend/modules/lab_request/models.py

from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric
from sqlalchemy.sql import func
from core.database import Base


class LabRequest(Base):
    """
    Main lab request table - stores basic information about testing requests
    """
    __tablename__ = "lab_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_code = Column(String, index=True, nullable=True)  # e.g. LR-1001
    product_name = Column(String, nullable=False)
    service_type = Column(String, nullable=False)  # EMC / Safety / Thermal / Calibration
    
    # ✅ NEW: Enhanced status fields
    status = Column(String, default="Pending")  # High-level: Pending, In Progress, Completed, Rejected
    detailed_status = Column(String, default="Submitted")  # Detailed: Submitted, Under Review, Quote Sent, etc.
    customer_message = Column(Text, nullable=True)  # Message shown to customer
    
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # ✅ NEW: Timeline fields
    estimated_completion = Column(DateTime(timezone=True), nullable=True)
    actual_completion = Column(DateTime(timezone=True), nullable=True)
    
    # Store engineer_id as integer without FK constraint
    assigned_engineer_id = Column(Integer, nullable=True)


class LabRequestProgress(Base):
    """
    Track progress updates for lab requests
    Multiple progress entries can exist for each request
    """
    __tablename__ = "lab_request_progress"

    id = Column(Integer, primary_key=True, index=True)
    lab_request_id = Column(Integer, nullable=False, index=True)

    progress_percent = Column(Integer, nullable=False)  # 0-100
    notes = Column(Text, nullable=True)
    updated_by = Column(String, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())


class LabSchedule(Base):
    """
    Schedule entries for lab testing sessions
    """
    __tablename__ = "lab_schedule"

    id = Column(Integer, primary_key=True, index=True)
    lab_request_id = Column(Integer, nullable=False, index=True)
    engineer_id = Column(Integer, nullable=False, index=True)

    start_datetime = Column(DateTime(timezone=True), nullable=False)
    end_datetime = Column(DateTime(timezone=True), nullable=False)
    schedule_status = Column(String, default="Scheduled")


class LabRequestStatusLog(Base):
    """
    Audit log for status changes
    """
    __tablename__ = "lab_request_status_logs"

    id = Column(Integer, primary_key=True, index=True)
    lab_request_id = Column(Integer, nullable=False, index=True)

    previous_status = Column(String, nullable=True)
    current_status = Column(String, nullable=False)
    
    # ✅ NEW: Track detailed status too
    previous_detailed_status = Column(String, nullable=True)
    current_detailed_status = Column(String, nullable=True)
    
    changed_by = Column(String, nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text, nullable=True)  # ✅ NEW: Why status changed


class LabRequestAssignment(Base):
    """
    Assignment history - tracks all engineer assignments
    """
    __tablename__ = "lab_request_assignments"

    id = Column(Integer, primary_key=True, index=True)
    lab_request_id = Column(Integer, nullable=False, index=True)
    engineer_id = Column(Integer, nullable=False, index=True)

    assigned_by = Column(String, nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())


class LabDocument(Base):
    """
    Documents attached to lab requests
    """
    __tablename__ = "lab_documents"

    id = Column(Integer, primary_key=True, index=True)
    lab_request_id = Column(Integer, nullable=False, index=True)

    document_type = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_by = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())


# ✅ NEW: Milestones table for tracking workflow stages
class LabRequestMilestone(Base):
    """
    Track workflow milestones for customer visibility
    """
    __tablename__ = "lab_request_milestones"

    id = Column(Integer, primary_key=True, index=True)
    lab_request_id = Column(Integer, nullable=False, index=True)
    
    milestone_type = Column(String, nullable=False)  # submitted, under_review, quote_sent, etc.
    milestone_status = Column(String, default="pending")  # pending, current, completed, skipped
    
    notes = Column(Text, nullable=True)
    estimated_date = Column(DateTime(timezone=True), nullable=True)
    completed_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ✅ NEW: Quotes table for pricing workflow
class LabQuote(Base):
    """
    Store quotes sent to customers
    """
    __tablename__ = "lab_quotes"

    id = Column(Integer, primary_key=True, index=True)
    lab_request_id = Column(Integer, nullable=False, index=True)
    
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    quote_details = Column(Text, nullable=True)  # JSON or text description
    
    status = Column(String, default="pending")  # pending, sent, approved, rejected
    valid_until = Column(DateTime(timezone=True), nullable=True)
    
    sent_at = Column(DateTime(timezone=True), nullable=True)
    responded_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())