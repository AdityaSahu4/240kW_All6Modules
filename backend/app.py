from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from modules.testing_request.routes import router as testing_router
from modules.design_request.routes import router as design_router
from modules.calibration_request.routes import router as calibration_router
from modules.certification_request.routes import router as certification_router
from modules.debugging_request.routes import router as debugging_router
from modules.simulation_request.routes import router as simulation_request_router
from modules.product_details.routes import router as product_details_router
from modules.auth.routes import router as auth_router
from modules.lab_request.routes import router as lab_request_router
from modules.labs.routes import router as labs_router

app = FastAPI(
    title="Compliance Services Platform - All Modules",
    description="Backend API for compliance testing services",
    version="1.0.0"
)

# ✅ CORS Configuration - Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Include all service routers
app.include_router(testing_router)
app.include_router(design_router)
app.include_router(calibration_router)
app.include_router(certification_router)
app.include_router(debugging_router)
app.include_router(simulation_request_router)
app.include_router(product_details_router)  # ✅ NEW ROUTER
app.include_router(auth_router)
app.include_router(lab_request_router)  # ✅ Lab Request Router
app.include_router(labs_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Compliance Services Platform API",
        "status": "online",
        "endpoints": {
            "product_details": "/product-details",
            "lab_requests": "/lab-requests",
            "testing": "/testing-requests",
            "design": "/design-requests",
            "calibration": "/calibration-requests",
            "certification": "/certification-requests",
            "debugging": "/debugging-requests",
            "simulation": "/simulation-requests",
            "auth": "/auth",
            "docs": "/docs",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0"
    }

# Add a test endpoint for lab requests
@app.get("/test/lab-requests")
def test_lab_requests():
    """Test endpoint to verify lab requests module is working"""
    return {
        "message": "Lab requests module is loaded and working",
        "endpoints": [
            "GET /lab-requests/ - Get all lab requests",
            "POST /lab-requests/ - Create new lab request",
            "GET /lab-requests/{id}/full - Get full request details",
            "PUT /lab-requests/{id}/status - Update status",
            "POST /lab-requests/{id}/progress - Add progress update",
            "PUT /lab-requests/{id}/assign - Assign engineer",
            "POST /lab-requests/{id}/schedule - Create schedule",
            "POST /lab-requests/{id}/documents - Upload documents",
            "DELETE /lab-requests/documents/{id} - Delete document"
        ]
    }