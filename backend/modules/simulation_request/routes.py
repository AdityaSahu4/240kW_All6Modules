# routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from . import services, schemas
from modules.simulation_request.models import SimulationRequest

router = APIRouter(prefix="/simulation-request", tags=["Simulation Request"])


@router.get("/{simulation_request_id}")
def get_request(simulation_request_id: int, db: Session = Depends(get_db)):
    sr = db.query(SimulationRequest).filter(
        SimulationRequest.id == simulation_request_id
    ).first()

    if not sr:
        raise HTTPException(status_code=404, detail="Not found")

    return {"id": sr.id, "status": sr.status}


@router.post("/")
def start_simulation_request(db: Session = Depends(get_db)):
    return services.create_simulation_request(db)


@router.post("/{simulation_request_id}/product")
def save_product(
    simulation_request_id: int,
    payload: schemas.SimulationProductDetailsSchema,
    db: Session = Depends(get_db)
):
    services.save_product_details(db, simulation_request_id, payload)
    return {"status": "saved"}


@router.post("/{simulation_request_id}/documents")
def save_documents(
    simulation_request_id: int,
    payload: schemas.SimulationTechnicalDocumentsSchema,
    db: Session = Depends(get_db)
):
    services.save_technical_documents(
        db,
        simulation_request_id,
        payload.documents
    )
    return {"status": "documents saved"}


@router.post("/{simulation_request_id}/details")
def save_simulation_details(
    simulation_request_id: int,
    payload: schemas.SimulationDetailsSchema,
    db: Session = Depends(get_db)
):
    services.save_simulation_details(db, simulation_request_id, payload)
    return {"status": "saved"}


@router.post("/{simulation_request_id}/submit")
def submit(
    simulation_request_id: int,
    db: Session = Depends(get_db)
):
    services.submit_request(db, simulation_request_id)
    return {"status": "submitted"}


@router.get("/{simulation_request_id}/full")
def get_full_request(
    simulation_request_id: int,
    db: Session = Depends(get_db)
):
    data = services.get_full_simulation_request(db, simulation_request_id)

    if not data:
        raise HTTPException(status_code=404, detail="Simulation request not found")

    return data