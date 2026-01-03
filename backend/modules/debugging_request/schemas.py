# backend/modules/debugging_request/schemas.py

from pydantic import BaseModel
from typing import List, Dict, Any, Optional


# -------- Master Response --------

class DebuggingRequestResponse(BaseModel):
    id: int
    status: str

    class Config:
        orm_mode = True


# -------- STEP 1 — Product Details --------
    
class DebuggingProductSchema(BaseModel):
    name: str
    quantity: int
    manufacturer: str
    model_no: str
    serial_no: str

    supply_voltage: str
    frequency: str
    current: str
    weight: str

    length: str
    width: str
    height: str

    ports: str
    interfaces: str

    software_name: str
    software_version: str

    application: List[str]

    preferred_date: str
    notes: Optional[str] = None


# -------- STEP 2 --------

class DebuggingDocumentsSchema(BaseModel):
    documents: List[Dict[str, Any]]


# -------- STEP 3 --------

class IssueReviewSchema(BaseModel):
    data: Dict[str, Any]
    reports: Optional[List[Dict[str, Any]]] = []


# -------- STEP 4 --------

class EngineerEvaluationSchema(BaseModel):
    evaluation: Optional[Dict[str, Any]] = None
    path_selected: Optional[str] = None
    comments: Optional[str] = None
