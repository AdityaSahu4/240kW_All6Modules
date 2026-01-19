# backend/modules/lab_request/schemas.py

from pydantic import BaseModel
from typing import Optional, List


# -----------------------------
# Basic Lab Request Creation
# -----------------------------
class LabRequestCreateSchema(BaseModel):
    product_name: str
    service_type: str  # EMC / Safety / Thermal


# -----------------------------
# Status Update
# -----------------------------
class LabStatusUpdateSchema(BaseModel):
    new_status: str
    changed_by: str  # auth.users.id


# -----------------------------
# Progress Updates
# -----------------------------
class LabProgressSchema(BaseModel):
    progress_percent: int
    notes: Optional[str] = None
    updated_by: str  # auth.users.id


# -----------------------------
# Assignment
# -----------------------------
class LabAssignmentSchema(BaseModel):
    engineer_id: int
    assigned_by: str  # auth.users.id


# -----------------------------
# Schedule
# -----------------------------
class LabScheduleSchema(BaseModel):
    engineer_id: int
    start_datetime: str  # ISO format
    end_datetime: str    # ISO format
    schedule_status: str  # Scheduled / Completed / Cancelled


# -----------------------------
# Document Upload Metadata
# -----------------------------
class LabDocumentSchema(BaseModel):
    document_type: str  # Test Report / Certificate
    file_name: str
    file_size: int
    file_path: Optional[str] = None
    uploaded_by: str  # auth.users.id


# -----------------------------
# For returning full request details
# -----------------------------
class LabRequestFullResponse(BaseModel):
    request: dict
    progress: List[dict]
    schedule: List[dict]
    status_logs: List[dict]
    assignments: List[dict]
    documents: List[dict]
