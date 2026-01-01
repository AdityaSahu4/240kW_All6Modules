#!/usr/bin/env python3
"""
Automated Module Generator for All Services
Generates backend modules and frontend API files for all service types
"""

import os
from pathlib import Path

# Service configurations
SERVICES = {
    "calibration": {
        "name": "Calibration",
        "prefix": "calibration",
        "table_prefix": "calibration",
        "success_route": "/services/calibration/submission-success",
        "steps": [
            "product-details",
            "technical-documents",
            "calibration-requirements",
            "calibration-standards",
            "lab-selection"
        ]
    },
    "certification": {
        "name": "Certification",
        "prefix": "certification",
        "table_prefix": "certification",
        "success_route": "/services/certification/submission-success",
        "steps": [
            "product-details",
            "technical-documents",
            "certification-requirements",
            "certification-standards",
            "lab-selection"
        ]
    },
    "debugging": {
        "name": "Debugging",
        "prefix": "debugging",
        "table_prefix": "debugging",
        "success_route": "/services/product-debugging/submission-success",
        "steps": [
            "product-details",
            "technical-documents",
            "debugging-requirements",
            "debugging-standards",
            "lab-selection"
        ]
    },
    "simulation": {
        "name": "Simulation",
        "prefix": "simulation",
        "table_prefix": "simulation",
        "success_route": "/services/simulation/submission-success",
        "steps": [
            "product-details",
            "technical-documents",
            "simulation-requirements",
            "simulation-standards",
            "lab-selection"
        ]
    }
}

def generate_models(service_key, config):
    """Generate models.py for a service"""
    prefix = config["table_prefix"]
    name = config["name"]
    
    return f'''from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from core.database import Base

class {name}Request(Base):
    __tablename__ = "{prefix}_requests"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="submitted")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class {name}ProductDetails(Base):
    __tablename__ = "{prefix}_product_details"

    id = Column(Integer, primary_key=True)
    {prefix}_request_id = Column(Integer, ForeignKey("{prefix}_requests.id"))

    eut_name = Column(String)
    eut_quantity = Column(String)
    manufacturer = Column(Text)
    model_no = Column(String)
    serial_no = Column(String)

    supply_voltage = Column(String)
    operating_frequency = Column(String)
    current = Column(String)
    weight = Column(String)

    length_mm = Column(String)
    width_mm = Column(String)
    height_mm = Column(String)

    power_ports = Column(String)
    signal_lines = Column(String)

    software_name = Column(String)
    software_version = Column(String)

    industry = Column(JSON)
    industry_other = Column(String)

    preferred_date = Column(String)
    notes = Column(Text)


class {name}TechnicalDocument(Base):
    __tablename__ = "{prefix}_technical_documents"

    id = Column(Integer, primary_key=True)
    {prefix}_request_id = Column(Integer, ForeignKey("{prefix}_requests.id"))

    doc_type = Column(String)
    file_name = Column(String)
    file_path = Column(String)
    file_size = Column(Integer)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())


class {name}Requirements(Base):
    __tablename__ = "{prefix}_requirements"

    id = Column(Integer, primary_key=True)
    {prefix}_request_id = Column(Integer, ForeignKey("{prefix}_requests.id"))

    test_type = Column(String)
    selected_tests = Column(JSON)


class {name}Standards(Base):
    __tablename__ = "{prefix}_standards"

    id = Column(Integer, primary_key=True)
    {prefix}_request_id = Column(Integer, ForeignKey("{prefix}_requests.id"))

    regions = Column(JSON)
    standards = Column(JSON)


class {name}LabSelection(Base):
    __tablename__ = "{prefix}_lab_selection"

    id = Column(Integer, primary_key=True)
    {prefix}_request_id = Column(Integer, ForeignKey("{prefix}_requests.id"))

    selected_labs = Column(JSON)
    region = Column(JSON)  # Store as {{country, state, city}}
    remarks = Column(Text)
'''

def generate_schemas(service_key, config):
    """Generate schemas.py for a service"""
    name = config["name"]
    
    return f'''# schemas.py
from pydantic import BaseModel
from typing import List, Optional, Dict

class DimensionsSchema(BaseModel):
    length: str
    width: str
    height: str

class {name}ProductDetailsSchema(BaseModel):
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

class {name}TechnicalDocumentItemSchema(BaseModel):
    doc_type: str
    file_name: str
    file_path: str | None = None
    file_size: int | None = 0


class {name}TechnicalDocumentsSchema(BaseModel):
    documents: List[{name}TechnicalDocumentItemSchema]

class {name}RequirementsSchema(BaseModel):
    test_type: str
    selected_tests: List[str]


class {name}StandardsSchema(BaseModel):
    regions: List[str]
    standards: List[str]


class {name}LabSelectionSchema(BaseModel):
    selected_labs: List[str]
    region: Optional[Dict[str, Optional[str]]] = None  # {{country, state, city}}
    remarks: Optional[str] = None
'''

def generate_services(service_key, config):
    """Generate services.py for a service"""
    name = config["name"]
    prefix = config["table_prefix"]
    
    return f'''# services.py
from sqlalchemy.orm import Session
from .models import (
    {name}Request,
    {name}ProductDetails,
    {name}TechnicalDocument,
    {name}Requirements,
    {name}Standards,
    {name}LabSelection
)
from .schemas import (
    {name}ProductDetailsSchema,
    {name}TechnicalDocumentsSchema,
    {name}RequirementsSchema,
    {name}StandardsSchema,
    {name}LabSelectionSchema
)

def create_{prefix}_request(db: Session):
    req = {name}Request(status="submitted")
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

def save_{prefix}_product_details(db: Session, {prefix}_request_id: int, payload: {name}ProductDetailsSchema):
    pd = db.query({name}ProductDetails).filter(
        {name}ProductDetails.{prefix}_request_id == {prefix}_request_id
    ).first()

    if not pd:
        pd = {name}ProductDetails({prefix}_request_id={prefix}_request_id)
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
    pd.preferred_date = payload.preferred_date
    pd.notes = payload.notes

    db.commit()


def save_{prefix}_technical_documents(
    db: Session,
    {prefix}_request_id: int,
    documents: list
):
    for doc in documents:
        td = {name}TechnicalDocument(
            {prefix}_request_id={prefix}_request_id,
            doc_type=doc.doc_type,
            file_name=doc.file_name,
            file_path=doc.file_path,
            file_size=doc.file_size or 0
        )
        db.add(td)

    db.commit()

def save_{prefix}_requirements(db: Session, {prefix}_request_id: int, payload: {name}RequirementsSchema):
    req = db.query({name}Requirements).filter(
        {name}Requirements.{prefix}_request_id == {prefix}_request_id
    ).first()

    if not req:
        req = {name}Requirements({prefix}_request_id={prefix}_request_id)
        db.add(req)

    req.test_type = payload.test_type
    req.selected_tests = payload.selected_tests

    db.commit()

def save_{prefix}_standards(db: Session, {prefix}_request_id: int, payload: {name}StandardsSchema):
    std = db.query({name}Standards).filter(
        {name}Standards.{prefix}_request_id == {prefix}_request_id
    ).first()

    if not std:
        std = {name}Standards({prefix}_request_id={prefix}_request_id)
        db.add(std)

    std.regions = payload.regions
    std.standards = payload.standards

    db.commit()

def save_{prefix}_lab_selection_draft(db: Session, {prefix}_request_id: int, payload: {name}LabSelectionSchema):
    """Save lab selection as draft without changing request status"""
    req = db.query({name}Request).filter(
        {name}Request.id == {prefix}_request_id
    ).first()

    if not req:
        raise ValueError("{name}Request not found")

    lab = db.query({name}LabSelection).filter(
        {name}LabSelection.{prefix}_request_id == {prefix}_request_id
    ).first()

    if lab:
        lab.selected_labs = payload.selected_labs
        if payload.region:
            lab.region = payload.region
        lab.remarks = payload.remarks
    else:
        lab = {name}LabSelection(
            {prefix}_request_id={prefix}_request_id,
            selected_labs=payload.selected_labs,
            region=payload.region if payload.region else None,
            remarks=payload.remarks
        )
        db.add(lab)

    db.commit()
    db.refresh(lab)
    return lab

def submit_{prefix}_request(db: Session, {prefix}_request_id: int, payload: {name}LabSelectionSchema):
    req = db.query({name}Request).filter(
        {name}Request.id == {prefix}_request_id
    ).first()

    if not req:
        raise ValueError("{name}Request not found")

    lab = db.query({name}LabSelection).filter(
        {name}LabSelection.{prefix}_request_id == {prefix}_request_id
    ).first()

    if lab:
        lab.selected_labs = payload.selected_labs
        if payload.region:
            lab.region = payload.region
        lab.remarks = payload.remarks
    else:
        lab = {name}LabSelection(
            {prefix}_request_id={prefix}_request_id,
            selected_labs=payload.selected_labs,
            region=payload.region if payload.region else None,
            remarks=payload.remarks
        )
        db.add(lab)

    req.status = "submitted"
    db.commit()

def get_full_{prefix}_request(db: Session, {prefix}_request_id: int):
    req = db.query({name}Request).filter(
        {name}Request.id == {prefix}_request_id
    ).first()

    if not req:
        return None

    product = db.query({name}ProductDetails).filter_by(
        {prefix}_request_id={prefix}_request_id
    ).first()

    requirements = db.query({name}Requirements).filter_by(
        {prefix}_request_id={prefix}_request_id
    ).first()

    standards = db.query({name}Standards).filter_by(
        {prefix}_request_id={prefix}_request_id
    ).first()

    lab = db.query({name}LabSelection).filter_by(
        {prefix}_request_id={prefix}_request_id
    ).first()

    # Convert SQLAlchemy objects to dictionaries for proper JSON serialization
    product_dict = None
    if product:
        product_dict = {{
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
            "preferred_date": product.preferred_date,
            "notes": product.notes
        }}

    requirements_dict = None
    if requirements:
        requirements_dict = {{
            "id": requirements.id,
            "test_type": requirements.test_type,
            "selected_tests": requirements.selected_tests or []
        }}

    standards_dict = None
    if standards:
        standards_dict = {{
            "id": standards.id,
            "regions": standards.regions or [],
            "standards": standards.standards or []
        }}

    lab_dict = None
    if lab:
        lab_dict = {{
            "id": lab.id,
            "selected_labs": lab.selected_labs or [],
            "region": lab.region,
            "remarks": lab.remarks
        }}

    return {{
        "{prefix}_request": {{
            "id": req.id,
            "status": req.status,
            "created_at": req.created_at.isoformat() if req.created_at else None
        }},
        "product": product_dict,
        "requirements": requirements_dict,
        "standards": standards_dict,
        "lab": lab_dict
    }}
'''

def generate_routes(service_key, config):
    """Generate routes.py for a service"""
    name = config["name"]
    prefix = config["table_prefix"]
    
    return f'''# routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from . import services, schemas
from modules.{service_key}_request.models import {name}Request


router = APIRouter(prefix="/{prefix}-request", tags=["{name} Request"])

@router.get("/{{{{prefix}}_request_id}}")
def get_request({prefix}_request_id: int, db: Session = Depends(get_db)):
    req = db.query({name}Request).filter(
        {name}Request.id == {prefix}_request_id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Not found")

    return {{"id": req.id, "status": req.status}}

@router.post("/")
def start_{prefix}_request(db: Session = Depends(get_db)):
    return services.create_{prefix}_request(db)


@router.post("/{{{{prefix}}_request_id}}/product")
def save_product(
    {prefix}_request_id: int,
    payload: schemas.{name}ProductDetailsSchema,
    db: Session = Depends(get_db)
):
    services.save_{prefix}_product_details(db, {prefix}_request_id, payload)
    return {{"status": "saved"}}

@router.post("/{{{{prefix}}_request_id}}/documents")
def save_documents(
    {prefix}_request_id: int,
    payload: schemas.{name}TechnicalDocumentsSchema,
    db: Session = Depends(get_db)
):
    services.save_{prefix}_technical_documents(
        db,
        {prefix}_request_id,
        payload.documents
    )
    return {{"status": "documents saved"}}

@router.post("/{{{{prefix}}_request_id}}/requirements")
def save_requirements(
    {prefix}_request_id: int,
    payload: schemas.{name}RequirementsSchema,
    db: Session = Depends(get_db)
):
    services.save_{prefix}_requirements(db, {prefix}_request_id, payload)
    return {{"status": "saved"}}


@router.post("/{{{{prefix}}_request_id}}/standards")
def save_standards(
    {prefix}_request_id: int,
    payload: schemas.{name}StandardsSchema,
    db: Session = Depends(get_db)
):
    services.save_{prefix}_standards(db, {prefix}_request_id, payload)
    return {{"status": "saved"}}


@router.post("/{{{{prefix}}_request_id}}/lab-selection/draft")
def save_lab_selection_draft(
    {prefix}_request_id: int,
    payload: schemas.{name}LabSelectionSchema,
    db: Session = Depends(get_db)
):
    """Save lab selection as draft"""
    services.save_{prefix}_lab_selection_draft(db, {prefix}_request_id, payload)
    return {{"status": "draft saved"}}

@router.post("/{{{{prefix}}_request_id}}/submit")
def submit(
    {prefix}_request_id: int,
    payload: schemas.{name}LabSelectionSchema,
    db: Session = Depends(get_db)
):
    services.submit_{prefix}_request(db, {prefix}_request_id, payload)
    return {{"status": "submitted"}}


@router.get("/{{{{prefix}}_request_id}}/full")
def get_full_request(
    {prefix}_request_id: int,
    db: Session = Depends(get_db)
):
    data = services.get_full_{prefix}_request(db, {prefix}_request_id)

    if not data:
        raise HTTPException(status_code=404, detail="{name} request not found")

    return data
'''

def generate_init(service_key, config):
    """Generate __init__.py for a service"""
    name = config["name"]
    prefix = config["table_prefix"]
    
    return f'''# {name} Request Module
from .routes import router
from .models import (
    {name}Request,
    {name}ProductDetails,
    {name}TechnicalDocument,
    {name}Requirements,
    {name}Standards,
    {name}LabSelection
)
from .services import (
    create_{prefix}_request,
    save_{prefix}_product_details,
    save_{prefix}_technical_documents,
    save_{prefix}_requirements,
    save_{prefix}_standards,
    save_{prefix}_lab_selection_draft,
    submit_{prefix}_request,
    get_full_{prefix}_request
)

__all__ = [
    "router",
    "{name}Request",
    "{name}ProductDetails",
    "{name}TechnicalDocument",
    "{name}Requirements",
    "{name}Standards",
    "{name}LabSelection",
    "create_{prefix}_request",
    "save_{prefix}_product_details",
    "save_{prefix}_technical_documents",
    "save_{prefix}_requirements",
    "save_{prefix}_standards",
    "save_{prefix}_lab_selection_draft",
    "submit_{prefix}_request",
    "get_full_{prefix}_request",
]
'''

def generate_frontend_api(service_key, config):
    """Generate frontend API file"""
    prefix = config["prefix"]
    
    return f'''import api from "./api"

// Start new {prefix} request
export const start{config["name"]}Request = async () => {{
  const res = await api.post("/{prefix}-request/")
  return res.data   // {{ id, status }}
}}

// Save product details
export const save{config["name"]}ProductDetails = (id, data) =>
  api.post(`/{prefix}-request/${{id}}/product`, data)

// Save technical documents
export const save{config["name"]}TechnicalDocuments = (id, data) =>
  api.post(`/{prefix}-request/${{id}}/documents`, data)

// Save {prefix} requirements
export const save{config["name"]}Requirements = (id, data) =>
  api.post(`/{prefix}-request/${{id}}/requirements`, data)

// Save {prefix} standards
export const save{config["name"]}Standards = (id, data) =>
  api.post(`/{prefix}-request/${{id}}/standards`, data)

// Save lab selection as draft
export const save{config["name"]}LabSelectionDraft = (id, data) =>
  api.post(`/{prefix}-request/${{id}}/lab-selection/draft`, data)

// Submit request (labs)
export const submit{config["name"]}Request = (id, data) =>
  api.post(`/{prefix}-request/${{id}}/submit`, data)

export const fetchFull{config["name"]}Request = (id) =>
  api.get(`/{prefix}-request/${{id}}/full`).then(res => res.data)
'''

def create_module(service_key, config, base_path):
    """Create all files for a service module"""
    module_path = base_path / f"{service_key}_request"
    module_path.mkdir(parents=True, exist_ok=True)
    
    # Generate backend files
    files = {
        "models.py": generate_models(service_key, config),
        "schemas.py": generate_schemas(service_key, config),
        "services.py": generate_services(service_key, config),
        "routes.py": generate_routes(service_key, config),
        "__init__.py": generate_init(service_key, config)
    }
    
    for filename, content in files.items():
        file_path = module_path / filename
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"✅ Created {file_path}")
    
    return module_path

def main():
    # Get project root
    script_dir = Path(__file__).parent
    backend_modules = script_dir / "modules"
    frontend_services = script_dir.parent / "src" / "pages" / "services"
    
    print("🚀 Starting module generation...")
    print(f"Backend path: {backend_modules}")
    print(f"Frontend path: {frontend_services}")
    print()
    
    # Create all modules
    for service_key, config in SERVICES.items():
        print(f"📦 Generating {config['name']} module...")
        
        # Create backend module
        create_module(service_key, config, backend_modules)
        
        # Create frontend API file
        api_file = frontend_services / f"{service_key}Api.js"
        with open(api_file, 'w') as f:
            f.write(generate_frontend_api(service_key, config))
        print(f"✅ Created {api_file}")
        print()
    
    print("✨ All modules generated successfully!")
    print()
    print("📝 Next steps:")
    print("1. Update backend/app.py to include all routers")
    print("2. Update src/App.jsx to include all routes")
    print("3. Restart backend server")
    print("4. Test each service flow")

if __name__ == "__main__":
    main()
