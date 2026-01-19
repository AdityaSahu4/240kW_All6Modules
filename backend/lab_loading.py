import csv
from pathlib import Path

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base


BASE_DIR = Path(__file__).resolve().parent               # backend/
DB_PATH = BASE_DIR / "database" / "labs.db"              # backend/database/labs.db
CSV_PATH = BASE_DIR / "data" / "labs.csv"                # backend/data/labs.csv

engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Lab(Base):
    __tablename__ = "labs"

    id = Column(Integer, primary_key=True, index=True)

    # name + address
    lab = Column(String, nullable=False)

    city = Column(String, default="")
    state = Column(String, default="")
    country = Column(String, default="")


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)


def load_labs(csv_path: Path):
    init_db()

    db = SessionLocal()

    with open(csv_path, newline="", encoding="latin-1") as f:
        reader = csv.DictReader(f)

        count = 0
        for row in reader:

            name = (row.get("LaboratoryName") or "").strip()
            address = (row.get("PrimeAddress") or "").strip()

            combined = f"{name}, {address}".strip().rstrip(",")

            lab = Lab(
                lab=combined,
                city=(row.get("City") or "").strip(),
                state=(row.get("State") or "").strip(),
                country=(row.get("Country") or "").strip(),
            )

            db.add(lab)
            count += 1

        db.commit()
        db.close()

    print(f"Inserted {count} labs successfully into {DB_PATH}")


if __name__ == "__main__":
    load_labs(CSV_PATH)