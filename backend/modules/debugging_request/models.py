# backend/modules/debugging_request/models.py

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    JSON,
    Text,
)
from sqlalchemy.sql import func
from core.database import Base


# -----------------------------
# Master Debugging Request
# -----------------------------

class DebuggingRequest(Base):
    __tablename__ = "debugging_requests"

    id = Column(Integer, primary_key=True, index=True)

    # lifecycle: submitted | under_review | diagnostics | debugging | completed
    status = Column(String, default="submitted")

    customer_email = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# -----------------------------
# STEP 1 — Structured Product Details
# -----------------------------

class DebuggingProduct(Base):
    __tablename__ = "debugging_product_details"

    id = Column(Integer, primary_key=True)
    debugging_request_id = Column(Integer, ForeignKey("debugging_requests.id"))

    # Basic information
    name = Column(String)
    quantity = Column(Integer)
    manufacturer = Column(String)
    model_no = Column(String)
    serial_no = Column(String)

    # Technical specs
    supply_voltage = Column(String)
    frequency = Column(String)
    current = Column(String)
    weight = Column(String)

    length = Column(String)
    width = Column(String)
    height = Column(String)

    # Connectivity
    ports = Column(String)
    interfaces = Column(String)

    # Software
    software_name = Column(String)
    software_version = Column(String)

    # Industry / Application
    application = Column(String)          # comma-separated list

    # Scheduling
    preferred_date = Column(String)
    notes = Column(Text)


# -----------------------------
# STEP 2 — Technical Documents
# -----------------------------

class DebuggingDocument(Base):
    __tablename__ = "debugging_documents"

    id = Column(Integer, primary_key=True)
    debugging_request_id = Column(Integer, ForeignKey("debugging_requests.id"))

    documents = Column(JSON)   # list of {name,path,type,uploaded_at}


# -----------------------------
# STEP 3 — Targeted Tests + Reports
# -----------------------------

class IssueReview(Base):
    __tablename__ = "debugging_issue_review"

    id = Column(Integer, primary_key=True)
    debugging_request_id = Column(Integer, ForeignKey("debugging_requests.id"))

    data = Column(JSON)      # selections + notes
    reports = Column(JSON)   # uploaded report files


# -----------------------------
# STEP 4 — Engineer Evaluation (later)
# -----------------------------

class EngineerEvaluation(Base):
    __tablename__ = "debugging_engineer_evaluation"

    id = Column(Integer, primary_key=True)
    debugging_request_id = Column(Integer, ForeignKey("debugging_requests.id"))

    evaluation = Column(JSON)
    path_selected = Column(String)   # recommendation | full_debugging
    comments = Column(Text)
