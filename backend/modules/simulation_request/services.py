# services.py
from sqlalchemy.orm import Session
from .models import (
    SimulationRequest,
    SimulationProductDetails,
    SimulationTechnicalDocument,
    SimulationDetails
)
from .schemas import (
    SimulationProductDetailsSchema,
    SimulationDetailsSchema
)

def create_simulation_request(db: Session):
    sr = SimulationRequest(status="submitted")
    db.add(sr)
    db.commit()
    db.refresh(sr)
    return sr

def save_draft(db: Session, simulation_request_id: int):
    sr = db.query(SimulationRequest).filter(
        SimulationRequest.id == simulation_request_id
    ).first()

    if not sr:
        raise ValueError("SimulationRequest not found")

    sr.status = "draft"
    db.commit()


def save_product_details(db: Session,simulation_request_id: int,payload: SimulationProductDetailsSchema):
    pd = db.query(SimulationProductDetails).filter(
        SimulationProductDetails.simulation_request_id == simulation_request_id
    ).first()

    if not pd:
        pd = SimulationProductDetails(simulation_request_id=simulation_request_id)
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
    pd.notes = payload.notes

    db.commit()


def save_technical_documents(
    db: Session,
    simulation_request_id: int,
    documents: list
):
    for doc in documents:
        td = SimulationTechnicalDocument(
            simulation_request_id=simulation_request_id,
            doc_type=doc.doc_type,
            file_name=doc.file_name,
            file_path=doc.file_path,
            file_size=doc.file_size or 0
        )
        db.add(td)

    db.commit()

def save_simulation_details(db: Session,simulation_request_id: int,payload: SimulationDetailsSchema):
    sd = db.query(SimulationDetails).filter(
        SimulationDetails.simulation_request_id == simulation_request_id
    ).first()

    if not sd:
        sd = SimulationDetails(simulation_request_id=simulation_request_id)
        db.add(sd)

    sd.product_type = payload.product_type
    sd.selected_simulations = payload.selected_simulations

    db.commit()

def submit_request(db: Session, simulation_request_id: int):
    sr = db.query(SimulationRequest).filter(
        SimulationRequest.id == simulation_request_id
    ).first()

    if not sr:
        raise ValueError("SimulationRequest not found")

    sr.status = "submitted"
    db.commit()

def get_full_simulation_request(db: Session, simulation_request_id: int):
    sr = db.query(SimulationRequest).filter(
        SimulationRequest.id == simulation_request_id
    ).first()

    if not sr:
        return None

    product = db.query(SimulationProductDetails).filter_by(
        simulation_request_id=simulation_request_id
    ).first()

    simulation = db.query(SimulationDetails).filter_by(
        simulation_request_id=simulation_request_id
    ).first()

    documents = db.query(SimulationTechnicalDocument).filter(
        SimulationTechnicalDocument.simulation_request_id == simulation_request_id
    ).all()

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
            "notes": product.notes
        }

    simulation_dict = None
    if simulation:
        simulation_dict = {
            "id": simulation.id,
            "product_type": simulation.product_type,
            "selected_simulations": simulation.selected_simulations or []
        }
    
    documents_list = [
        {
            "id": d.id,
            "doc_type": d.doc_type,
            "file_name": d.file_name,
            "file_path": d.file_path,
            "file_size": d.file_size
        }
    for d in documents
    ]

    return {
        "simulation_request": {
            "id": sr.id,
            "status": sr.status,
            "created_at": sr.created_at.isoformat() if sr.created_at else None
        },
        "product": product_dict,
        "simulation": simulation_dict,
        "technical_documents": documents_list
    }
