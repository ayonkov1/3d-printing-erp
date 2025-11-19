"""
Database seeding script to populate initial data
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.color import Color
from app.models.brand import Brand
from app.models.material import Material
from app.models.spool import Spool
import uuid


def seed_database():
    """Seed the database with initial data"""
    db: Session = SessionLocal()

    try:
        # Check if data already exists
        existing_spools = db.query(Spool).count()
        if existing_spools > 0:
            print(f"⏭️  Database already seeded ({existing_spools} spools exist)")
            return

        print("🌱 Seeding database...")

        # Create Colors
        colors = [
            Color(id=str(uuid.uuid4()), name="Black", hex_code="#000000"),
            Color(id=str(uuid.uuid4()), name="White", hex_code="#FFFFFF"),
            Color(id=str(uuid.uuid4()), name="Red", hex_code="#FF0000"),
            Color(id=str(uuid.uuid4()), name="Blue", hex_code="#0000FF"),
            Color(id=str(uuid.uuid4()), name="Green", hex_code="#00FF00"),
            Color(id=str(uuid.uuid4()), name="Yellow", hex_code="#FFFF00"),
            Color(id=str(uuid.uuid4()), name="Orange", hex_code="#FF8800"),
            Color(id=str(uuid.uuid4()), name="Purple", hex_code="#800080"),
        ]
        db.add_all(colors)
        db.flush()
        print(f"  ✅ Created {len(colors)} colors")

        # Create Brands
        brands = [
            Brand(id=str(uuid.uuid4()), name="Prusament"),
            Brand(id=str(uuid.uuid4()), name="Polymaker"),
            Brand(id=str(uuid.uuid4()), name="eSUN"),
            Brand(id=str(uuid.uuid4()), name="Hatchbox"),
        ]
        db.add_all(brands)
        db.flush()
        print(f"  ✅ Created {len(brands)} brands")

        # Create Materials
        materials = [
            Material(id=str(uuid.uuid4()), name="PLA"),
            Material(id=str(uuid.uuid4()), name="ABS"),
            Material(id=str(uuid.uuid4()), name="PETG"),
            Material(id=str(uuid.uuid4()), name="TPU"),
            Material(id=str(uuid.uuid4()), name="Nylon"),
        ]
        db.add_all(materials)
        db.flush()
        print(f"  ✅ Created {len(materials)} materials")

        # Create 10 Spools with diverse data
        spools_data = [
            {
                "barcode": "PLA-BLK-001",
                "quantity": 1,
                "is_box": False,
                "weight": 1000.0,
                "thickness": 1.75,
                "spool_return": True,
                "status": "in_stock",
                "material": materials[0],  # PLA
                "brand": brands[0],  # Prusament
                "color": colors[0],  # Black
            },
            {
                "barcode": "PLA-WHT-002",
                "quantity": 2,
                "is_box": True,
                "weight": 1000.0,
                "thickness": 1.75,
                "spool_return": True,
                "status": "in_stock",
                "material": materials[0],  # PLA
                "brand": brands[1],  # Polymaker
                "color": colors[1],  # White
            },
            {
                "barcode": "ABS-RED-003",
                "quantity": 1,
                "is_box": False,
                "weight": 1000.0,
                "thickness": 1.75,
                "spool_return": False,
                "status": "in_use",
                "material": materials[1],  # ABS
                "brand": brands[2],  # eSUN
                "color": colors[2],  # Red
            },
            {
                "barcode": "PETG-BLU-004",
                "quantity": 3,
                "is_box": True,
                "weight": 1000.0,
                "thickness": 1.75,
                "spool_return": True,
                "status": "in_stock",
                "material": materials[2],  # PETG
                "brand": brands[3],  # Hatchbox
                "color": colors[3],  # Blue
            },
            {
                "barcode": "PLA-GRN-005",
                "quantity": 1,
                "is_box": False,
                "weight": 750.0,
                "thickness": 1.75,
                "spool_return": True,
                "status": "in_stock",
                "material": materials[0],  # PLA
                "brand": brands[0],  # Prusament
                "color": colors[4],  # Green
            },
            {
                "barcode": "TPU-YEL-006",
                "quantity": 1,
                "is_box": False,
                "weight": 500.0,
                "thickness": 1.75,
                "spool_return": False,
                "status": "in_stock",
                "material": materials[3],  # TPU
                "brand": brands[1],  # Polymaker
                "color": colors[5],  # Yellow
            },
            {
                "barcode": "PETG-ORG-007",
                "quantity": 2,
                "is_box": False,
                "weight": 1000.0,
                "thickness": 2.85,
                "spool_return": True,
                "status": "in_stock",
                "material": materials[2],  # PETG
                "brand": brands[2],  # eSUN
                "color": colors[6],  # Orange
            },
            {
                "barcode": "NYL-PRP-008",
                "quantity": 1,
                "is_box": False,
                "weight": 1000.0,
                "thickness": 1.75,
                "spool_return": False,
                "status": "ordered",
                "material": materials[4],  # Nylon
                "brand": brands[3],  # Hatchbox
                "color": colors[7],  # Purple
            },
            {
                "barcode": "PLA-BLK-009",
                "quantity": 1,
                "is_box": False,
                "weight": 250.0,
                "thickness": 1.75,
                "spool_return": True,
                "status": "depleted",
                "material": materials[0],  # PLA
                "brand": brands[0],  # Prusament
                "color": colors[0],  # Black
            },
            {
                "barcode": "ABS-WHT-010",
                "quantity": 5,
                "is_box": True,
                "weight": 1000.0,
                "thickness": 1.75,
                "spool_return": False,
                "status": "in_stock",
                "material": materials[1],  # ABS
                "brand": brands[1],  # Polymaker
                "color": colors[1],  # White
            },
        ]

        spools = []
        for spool_data in spools_data:
            spool = Spool(
                id=str(uuid.uuid4()),
                barcode=spool_data["barcode"],
                quantity=spool_data["quantity"],
                is_box=spool_data["is_box"],
                weight=spool_data["weight"],
                thickness=spool_data["thickness"],
                spool_return=spool_data["spool_return"],
                status=spool_data["status"],
                is_in_use=spool_data["status"] == "in_use",
                material_id=spool_data["material"].id,
                brand_id=spool_data["brand"].id,
                color_id=spool_data["color"].id,
            )
            spools.append(spool)

        db.add_all(spools)
        db.commit()
        print(f"  ✅ Created {len(spools)} spools")
        print("✅ Database seeded successfully!")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
