# modules/simulation_request/schemas.py
from pydantic import BaseModel
from typing import List, Optional, Dict

class DimensionsSchema(BaseModel):
    length: str
    width: str
    height: str

class SimulationProductDetailsSchema(BaseModel):
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

    notes: Optional[str]


# TECHNICAL DOCUMENTS
class SimulationTechnicalDocumentItemSchema(BaseModel):
    doc_type: str
    file_name: str
    file_path: Optional[str] = None
    file_size: Optional[int] = 0


class SimulationTechnicalDocumentsSchema(BaseModel):
    documents: List[SimulationTechnicalDocumentItemSchema]



# SIMULATION-SPECIFIC
class SimulationDetailsSchema(BaseModel):
    product_type: str
    selected_simulations: List[str]
