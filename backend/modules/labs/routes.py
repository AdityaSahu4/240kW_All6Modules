from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pathlib import Path

router = APIRouter(prefix="/labs", tags=["Labs"])

# ---------- DB CONNECTION ----------
BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = BASE_DIR / "database" / "labs.db"

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------- ROUTES ----------

@router.get("/")
def get_labs(
    country: str | None = Query(None),
    state: str | None = Query(None),
    city: str | None = Query(None),
):
    """
    Returns labs filtered by optional country/state/city.
    """
    try:
        query = "SELECT id, lab, city, state, country FROM labs WHERE 1=1"
        params = {}

        if country:
            query += " AND LOWER(TRIM(country)) = LOWER(TRIM(:country))"
            params["country"] = country

        if state:
            query += " AND LOWER(TRIM(state)) = LOWER(TRIM(:state))"
            params["state"] = state

        if city:
            query += " AND LOWER(TRIM(city)) = LOWER(TRIM(:city))"
            params["city"] = city

        with engine.connect() as db:
            rows = db.execute(text(query), params).fetchall()

        return [
            {
                "id": r.id,
                "lab_name": r.lab,
                "lab": r.lab,
                "city": r.city,
                "state": r.state,
                "country": r.country
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(500, f"Failed to load labs: {str(e)}")


@router.get("/filters")
def get_lab_filters():
    """
    Returns distinct states and cities for dropdown filters.
    """
    try:
        with engine.connect() as db:
            states = [
                r[0]
                for r in db.execute(
                    text("""
                        SELECT DISTINCT TRIM(state)
                        FROM labs
                        WHERE state IS NOT NULL AND TRIM(state) != ''
                        ORDER BY TRIM(state)
                    """)
                )
            ]

            cities = [
                r[0]
                for r in db.execute(
                    text("""
                        SELECT DISTINCT TRIM(city)
                        FROM labs
                        WHERE city IS NOT NULL AND TRIM(city) != ''
                        ORDER BY TRIM(city)
                    """)
                )
            ]

        return {"states": states, "cities": cities}

    except Exception as e:
        raise HTTPException(500, f"Failed to load filters: {str(e)}")


@router.get("/cities")
def get_cities(state: str | None = Query(None)):
    """
    Returns cities, optionally filtered by state.
    """
    try:
        query = """
            SELECT DISTINCT TRIM(city)
            FROM labs
            WHERE city IS NOT NULL AND TRIM(city) != ''
        """
        params = {}

        if state:
            query += " AND LOWER(TRIM(state)) = LOWER(TRIM(:state))"
            params["state"] = state

        query += " ORDER BY TRIM(city)"

        with engine.connect() as db:
            rows = db.execute(text(query), params).fetchall()

        return [r[0] for r in rows]

    except Exception as e:
        raise HTTPException(500, f"Failed to load cities: {str(e)}")
