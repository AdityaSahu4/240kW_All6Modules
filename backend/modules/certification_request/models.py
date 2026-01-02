from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from core.database import Base

class CertificationRequest(Base):
    __tablename__ = "certification_requests"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="draft")
    target_region = Column(String)
    product_name = Column(String)
    product_category = Column(String)
    standards = Column(JSON)
    estimated_fee_range = Column(String)
    additional_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class CertificationTechnicalDocument(Base):
    __tablename__ = "certification_technical_documents"

    id = Column(Integer, primary_key=True)
    certification_request_id = Column(Integer, ForeignKey("certification_requests.id", ondelete="CASCADE"))

    doc_type = Column(String)
    file_name = Column(String)
    file_path = Column(String)
    file_size = Column(Integer)
    display_order = Column(Integer, default=0)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())


class CertificationLabSelection(Base):
    __tablename__ = "certification_lab_selection"

    id = Column(Integer, primary_key=True)
    certification_request_id = Column(Integer, ForeignKey("certification_requests.id", ondelete="CASCADE"))

    selected_labs = Column(JSON)
    region = Column(JSON)  # Store as {country, state, city}
    remarks = Column(Text)
