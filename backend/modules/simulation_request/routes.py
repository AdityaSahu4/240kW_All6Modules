# routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from . import services, schemas
from modules.simulation_request.models import SimulationRequest


router = APIRouter(prefix="/simulation-request", tags=["Simulation Request"])

@router.get("/{{prefix}_request_id}")
def get_request(simulation_request_id: int, db: Session = Depends(get_db)):
    req = db.query(SimulationRequest).filter(
        SimulationRequest.id == simulation_request_id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Not found")

    return {"id": req.id, "status": req.status}

@router.post("/")
def start_simulation_request(db: Session = Depends(get_db)):
    return services.create_simulation_request(db)


@router.post("/{{prefix}_request_id}/product")
def save_product(
    simulation_request_id: int,
    payload: schemas.SimulationProductDetailsSchema,
    db: Session = Depends(get_db)
):
    services.save_simulation_product_details(db, simulation_request_id, payload)
    return {"status": "saved"}

@router.post("/{{prefix}_request_id}/documents")
def save_documents(
    simulation_request_id: int,
    payload: schemas.SimulationTechnicalDocumentsSchema,
    db: Session = Depends(get_db)
):
    services.save_simulation_technical_documents(
        db,
        simulation_request_id,
        payload.documents
    )
    return {"status": "documents saved"}

@router.post("/{{prefix}_request_id}/requirements")
def save_requirements(
    simulation_request_id: int,
    payload: schemas.SimulationRequirementsSchema,
    db: Session = Depends(get_db)
):
    services.save_simulation_requirements(db, simulation_request_id, payload)
    return {"status": "saved"}


@router.post("/{{prefix}_request_id}/standards")
def save_standards(
    simulation_request_id: int,
    payload: schemas.SimulationStandardsSchema,
    db: Session = Depends(get_db)
):
    services.save_simulation_standards(db, simulation_request_id, payload)
    return {"status": "saved"}


@router.post("/{{prefix}_request_id}/lab-selection/draft")
def save_lab_selection_draft(
    simulation_request_id: int,
    payload: schemas.SimulationLabSelectionSchema,
    db: Session = Depends(get_db)
):
    """Save lab selection as draft"""
    services.save_simulation_lab_selection_draft(db, simulation_request_id, payload)
    return {"status": "draft saved"}

@router.post("/{{prefix}_request_id}/submit")
def submit(
    simulation_request_id: int,
    payload: schemas.SimulationLabSelectionSchema,
    db: Session = Depends(get_db)
):
    services.submit_simulation_request(db, simulation_request_id, payload)
    return {"status": "submitted"}


@router.get("/{{prefix}_request_id}/full")
def get_full_request(
    simulation_request_id: int,
    db: Session = Depends(get_db)
):
    data = services.get_full_simulation_request(db, simulation_request_id)

    if not data:
        raise HTTPException(status_code=404, detail="Simulation request not found")

    return data
