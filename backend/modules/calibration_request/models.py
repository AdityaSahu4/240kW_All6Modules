# backend/modules/calibration_request/models.py
# ✅ ENHANCED: Added lab_request_id to track linked lab request

from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from core.database import Base


class CalibrationRequest(Base):
    """
    Main calibration request table
    """
    __tablename__ = "calibration_requests"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="draft")  # draft, submitted, in_progress, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # ✅ NEW: Link to lab request (optional - for tracking)
    lab_request_id = Column(Integer, nullable=True, index=True)


class CalibrationProductDetails(Base):
    """
    Stores detailed product information for calibration
    """
    __tablename__ = "calibration_product_details"

    id = Column(Integer, primary_key=True, index=True)
    calibration_request_id = Column(Integer, nullable=False, index=True)

    # Basic Product Info
    eut_name = Column(String, nullable=True)
    eut_quantity = Column(Integer, nullable=True)
    manufacturer = Column(String, nullable=True)
    model_no = Column(String, nullable=True)
    serial_no = Column(String, nullable=True)

    # Technical Specifications
    supply_voltage = Column(String, nullable=True)
    operating_frequency = Column(String, nullable=True)
    current = Column(String, nullable=True)
    weight = Column(String, nullable=True)

    # Dimensions
    length_mm = Column(Integer, nullable=True)
    width_mm = Column(Integer, nullable=True)
    height_mm = Column(Integer, nullable=True)

    # Interfaces
    power_ports = Column(String, nullable=True)
    signal_lines = Column(String, nullable=True)

    # Software Info
    software_name = Column(String, nullable=True)
    software_version = Column(String, nullable=True)

    # Business Info
    industry = Column(String, nullable=True)
    industry_other = Column(String, nullable=True)
    preferred_date = Column(String, nullable=True)
    notes = Column(Text, nullable=True)


class CalibrationTechnicalDocument(Base):
    """
    Stores uploaded documents for calibration requests
    """
    __tablename__ = "calibration_technical_documents"

    id = Column(Integer, primary_key=True, index=True)
    calibration_request_id = Column(Integer, nullable=False, index=True)

    doc_type = Column(String, nullable=False)  # datasheet, manual, schematic, etc.
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Relative path from backend/
    file_size = Column(Integer, nullable=False)  # Size in bytes

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CalibrationRequirements(Base):
    """
    Stores calibration test requirements
    """
    __tablename__ = "calibration_requirements"

    id = Column(Integer, primary_key=True, index=True)
    calibration_request_id = Column(Integer, nullable=False, index=True)

    test_type = Column(String, nullable=True)  # e.g., "Electrical", "Environmental"
    selected_tests = Column(JSON, nullable=True)  # Array of selected test names


class CalibrationStandards(Base):
    """
    Stores selected calibration standards and regions
    """
    __tablename__ = "calibration_standards"

    id = Column(Integer, primary_key=True, index=True)
    calibration_request_id = Column(Integer, nullable=False, index=True)

    regions = Column(JSON, nullable=True)  # Array of regions (e.g., ["USA", "Europe"])
    standards = Column(JSON, nullable=True)  # Array of standards (e.g., ["ISO/IEC 17025"])


class CalibrationLabSelection(Base):
    """
    Stores selected labs for calibration
    """
    __tablename__ = "calibration_lab_selection"

    id = Column(Integer, primary_key=True, index=True)
    calibration_request_id = Column(Integer, nullable=False, index=True)

    selected_labs = Column(JSON, nullable=True)  # Array of lab names
    region = Column(String, nullable=True)
    remarks = Column(Text, nullable=True)


class CalibrationConfirmation(Base):
    """
    Stores confirmation checkboxes from the details page
    """
    __tablename__ = "calibration_confirmations"

    id = Column(Integer, primary_key=True, index=True)
    calibration_request_id = Column(Integer, nullable=False, unique=True, index=True)

    approve_plan = Column(String, nullable=True)  # "true" or "false"
    understand_tests = Column(String, nullable=True)  # "true" or "false"
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CalibrationApproval(Base):
    """
    Stores approval checkboxes from the review page
    """
    __tablename__ = "calibration_approvals"

    id = Column(Integer, primary_key=True, index=True)
    calibration_request_id = Column(Integer, nullable=False, unique=True, index=True)

    confirm_accurate = Column(String, nullable=True)  # "true" or "false"
    confirm_approve = Column(String, nullable=True)  # "true" or "false"
    confirm_understand = Column(String, nullable=True)  # "true" or "false"
    created_at = Column(DateTime(timezone=True), server_default=func.now())