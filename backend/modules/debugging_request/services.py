# backend/modules/debugging_request/services.py

from sqlalchemy.orm import Session

from .models import (
    DebuggingRequest,
    DebuggingProduct,
    DebuggingDocument,
    IssueReview,
    EngineerEvaluation,
)


# -------- Create Request --------
def start_debugging_request(db: Session):
    req = DebuggingRequest()
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


# -------- READ (basic) --------
def get_request(db: Session, request_id: int):
    return db.get(DebuggingRequest, request_id)


# -------- READ (full composite view) --------
def get_full_request(db: Session, request_id: int):
    req = db.get(DebuggingRequest, request_id)
    if not req:
        return None

    product = (
        db.query(DebuggingProduct)
        .filter(DebuggingProduct.debugging_request_id == request_id)
        .first()
    )

    docs = (
        db.query(DebuggingDocument)
        .filter(DebuggingDocument.debugging_request_id == request_id)
        .first()
    )

    issue = (
        db.query(IssueReview)
        .filter(IssueReview.debugging_request_id == request_id)
        .first()
    )

    engineer = (
        db.query(EngineerEvaluation)
        .filter(EngineerEvaluation.debugging_request_id == request_id)
        .first()
    )

    return {
        "id": req.id,
        "status": req.status,
        "product": product,
        "documents": docs.documents if docs else [],
        "issue_review": {
            "data": issue.data if issue else {},
            "reports": issue.reports if issue else [],
            "debug_path": (issue.data or {}).get("debug_path") if issue else None,
        },
        "engineer_evaluation": engineer.evaluation if engineer else None,
    }


# -------- STEP 1 — Product --------
def save_product_details(db: Session, request_id: int, payload):
    row = (
        db.query(DebuggingProduct)
        .filter(DebuggingProduct.debugging_request_id == request_id)
        .first()
    )

    if not row:
        row = DebuggingProduct(debugging_request_id=request_id)
        db.add(row)

    data = payload.dict()
    data["application"] = ",".join(payload.application)

    for k, v in data.items():
        setattr(row, k, v)

    db.commit()
    return row


# -------- STEP 2 — Documents --------
def save_documents(db: Session, request_id: int, docs):
    record = (
        db.query(DebuggingDocument)
        .filter(DebuggingDocument.debugging_request_id == request_id)
        .first()
    )

    if not record:
        record = DebuggingDocument(
            debugging_request_id=request_id,
            documents=docs,
        )
        db.add(record)
    else:
        record.documents = (record.documents or []) + docs

    db.commit()
    return record


# -------- STEP 3 — Issue Review --------
def save_issue_review(db: Session, request_id: int, payload):
    record = (
        db.query(IssueReview)
        .filter(IssueReview.debugging_request_id == request_id)
        .first()
    )

    if not record:
        record = IssueReview(debugging_request_id=request_id)
        db.add(record)

    if payload.data is not None:
        record.data = payload.data

    if payload.reports:
        record.reports = (record.reports or []) + payload.reports

    db.commit()
    return record


# -------- Submit --------
def submit_request(db: Session, request_id: int):
    req = db.get(DebuggingRequest, request_id)
    if not req:
        return None

    req.status = "under_review"
    db.commit()
    return req


# -------- Engineer Review --------
def save_engineer_evaluation(db: Session, request_id: int, payload):
    record = (
        db.query(EngineerEvaluation)
        .filter(EngineerEvaluation.debugging_request_id == request_id)
        .first()
    )

    if not record:
        record = EngineerEvaluation(debugging_request_id=request_id)
        db.add(record)

    record.evaluation = payload.evaluation
    record.path_selected = payload.path_selected
    record.comments = payload.comments

    db.commit()
    return record
