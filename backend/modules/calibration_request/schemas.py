# schemas.py
from pydantic import BaseModel
from typing import List, Optional, Dict

class DimensionsSchema(BaseModel):
    length: str
    width: str
    height: str

class CalibrationProductDetailsSchema(BaseModel):
    eut_name: str
    eut_quantity: str
    manufacturer: str
    model_no: str
    serial_no: str

    supply_voltage: str
    operating_frequency: Optional[str]
    current: str
    weight: str

    dimensions: DimensionsSchema

    power_ports: str
    signal_lines: str
    software_name: Optional[str]
    software_version: Optional[str]

    industry: List[str]
    industry_other: Optional[str]

    preferred_date: Optional[str]
    notes: Optional[str]

class CalibrationTechnicalDocumentItemSchema(BaseModel):
    doc_type: str
    file_name: str
    file_path: str | None = None
    file_size: int | None = 0


class CalibrationTechnicalDocumentsSchema(BaseModel):
    documents: List[CalibrationTechnicalDocumentItemSchema]

class CalibrationRequirementsSchema(BaseModel):
    test_type: str
    selected_tests: List[str]


class CalibrationStandardsSchema(BaseModel):
    regions: List[str]
    standards: List[str]


class CalibrationLabSelectionSchema(BaseModel):
    selected_labs: List[str]
    region: Optional[Dict[str, Optional[str]]] = None  # {country, state, city}
    remarks: Optional[str] = None


class CalibrationConfirmationSchema(BaseModel):
    approve_plan: bool
    understand_tests: bool


class CalibrationApprovalSchema(BaseModel):
    confirm_accurate: bool
    confirm_approve: bool
    confirm_understand: bool

