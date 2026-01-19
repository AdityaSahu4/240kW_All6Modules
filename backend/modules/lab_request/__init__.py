# backend/modules/lab_request/__init__.py

from .routes import router

from .models import (
    LabRequest,
    LabRequestProgress,
    LabSchedule,
    LabRequestStatusLog,
    LabRequestAssignment,
    LabDocument
)

from .services import (
    create_lab_request,
    get_all_lab_requests,
    get_full_lab_request,
    update_lab_request_status,
    add_lab_progress,
    assign_lab_engineer,
    create_lab_schedule,
    upload_lab_documents,
    delete_lab_document,
)

__all__ = [
    "router",
    "LabRequest",
    "LabRequestProgress",
    "LabSchedule",
    "LabRequestStatusLog",
    "LabRequestAssignment",
    "LabDocument",
    "create_lab_request",
    "get_all_lab_requests",
    "get_full_lab_request",
    "update_lab_request_status",
    "add_lab_progress",
    "assign_lab_engineer",
    "create_lab_schedule",
    "upload_lab_documents",
    "delete_lab_document"
]