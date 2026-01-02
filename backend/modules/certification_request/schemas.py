# schemas.py
from pydantic import BaseModel
from typing import List, Optional, Dict


class CertificationDetailsSchema(BaseModel):
    target_region: str
    product_name: str
    product_category: str
    standards: List[str]
    estimated_fee_range: str
    additional_notes: Optional[str] = None


class CertificationLabSelectionSchema(BaseModel):
    selected_labs: List[str]
    region: Optional[Dict[str, Optional[str]]] = None  # {country, state, city}
    remarks: Optional[str] = None
