from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from core.database import Base

class DesignRequest(Base):
    __tablename__ = "design_requests"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="submitted")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DesignProductDetails(Base):
    __tablename__ = "design_product_details"

    id = Column(Integer, primary_key=True)
    design_request_id = Column(Integer, ForeignKey("design_requests.id"))

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

    # preferred_date = Column(String)
    # notes = Column(Text)


class DesignTechnicalDocument(Base):
    __tablename__ = "design_technical_documents"

    id = Column(Integer, primary_key=True)
    design_request_id = Column(Integer, ForeignKey("design_requests.id"))

    doc_type = Column(String)
    file_name = Column(String)
    file_path = Column(String)
    file_size = Column(Integer)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())


class DesignRequirements(Base):
    __tablename__ = "design_requirements"

    id = Column(Integer, primary_key=True)
    design_request_id = Column(Integer, ForeignKey("design_requests.id"))

    test_type = Column(String)
    selected_tests = Column(JSON)


class DesignStandards(Base):
    __tablename__ = "design_standards"

    id = Column(Integer, primary_key=True)
    design_request_id = Column(Integer, ForeignKey("design_requests.id"))

    regions = Column(JSON)
    standards = Column(JSON)


class DesignLabSelection(Base):
    __tablename__ = "design_lab_selection"

    id = Column(Integer, primary_key=True)
    design_request_id = Column(Integer, ForeignKey("design_requests.id"))

    selected_labs = Column(JSON)
    region = Column(JSON)  # Store as {country, state, city}
    remarks = Column(Text)
