from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base, auth_engine, AuthBase
from modules.testing_request.routes import router as testing_router
from modules.design_request.routes import router as design_router
from modules.calibration_request.routes import router as calibration_router
from modules.certification_request.routes import router as certification_router
from modules.debugging_request.routes import router as debugging_router
from modules.simulation_request.routes import router as simulation_request_router
from modules.product_details.routes import router as product_details_router
from modules.auth.routes import router as auth_router

app = FastAPI(title="Compliance Services Platform - All Modules")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ CREATE TABLES IN POSTGRES
Base.metadata.create_all(bind=engine)
AuthBase.metadata.create_all(bind=auth_engine)

# Routers
app.include_router(testing_router)
app.include_router(design_router)
app.include_router(calibration_router)
app.include_router(certification_router)
app.include_router(debugging_router)
app.include_router(simulation_request_router)
app.include_router(product_details_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "message": "Compliance Services Platform API",
        "health": "/health",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
