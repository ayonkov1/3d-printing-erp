"""
Database seeding script to populate initial data
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.color import Color
from app.models.brand import Brand
from app.models.material import Material
from app.models.spool import Spool
from app.models.trade_name import TradeName
from app.models.category import Category
from app.models.status import Status
from app.models.inventory import Inventory
import uuid


def seed_database():
    """Seed the database with initial data"""
    db: Session = SessionLocal()

    try:
        # Check if data already exists
        existing_statuses = db.query(Status).count()
        if existing_statuses > 0:
            print(f"⏭️  Database already seeded ({existing_statuses} statuses exist)")
            return

        print("🌱 Seeding database...")

        # Create Statuses (lookup table)
        statuses = [
            Status(id=str(uuid.uuid4()), name="in_stock"),
            Status(id=str(uuid.uuid4()), name="in_use"),
            Status(id=str(uuid.uuid4()), name="depleted"),
            Status(id=str(uuid.uuid4()), name="ordered"),
        ]
        db.add_all(statuses)
        db.flush()
        print(f"  ✅ Created {len(statuses)} statuses")

        # Create Categories (lookup table)
        categories = [
            Category(id=str(uuid.uuid4()), name="Standard"),
            Category(id=str(uuid.uuid4()), name="Engineering"),
            Category(id=str(uuid.uuid4()), name="Specialty"),
            Category(id=str(uuid.uuid4()), name="Flexible"),
        ]
        db.add_all(categories)
        db.flush()
        print(f"  ✅ Created {len(categories)} categories")

        # Create Trade Names (lookup table)
        trade_names = [
            TradeName(id=str(uuid.uuid4()), name="Prusament PLA"),
            TradeName(id=str(uuid.uuid4()), name="PolyLite PLA"),
            TradeName(id=str(uuid.uuid4()), name="eSUN PLA+"),
            TradeName(id=str(uuid.uuid4()), name="Hatchbox PLA"),
        ]
        db.add_all(trade_names)
        db.flush()
        print(f"  ✅ Created {len(trade_names)} trade names")

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

        # Create Spool Types (catalog/archetypes)
        spools_data = [
            {
                "barcode": f"SPL{uuid.uuid4().hex[:8].upper()}",
                "base_weight": 1000.0,
                "is_box": False,
                "thickness": 1.75,
                "spool_return": True,
                "material": materials[0],  # PLA
                "brand": brands[0],  # Prusament
                "color": colors[0],  # Black
                "trade_name": trade_names[0],  # Prusament PLA
                "category": categories[0],  # Standard
            },
            {
                "barcode": f"SPL{uuid.uuid4().hex[:8].upper()}",
                "base_weight": 1000.0,
                "is_box": True,
                "thickness": 1.75,
                "spool_return": True,
                "material": materials[0],  # PLA
                "brand": brands[1],  # Polymaker
                "color": colors[1],  # White
                "trade_name": trade_names[1],  # PolyLite PLA
                "category": categories[0],  # Standard
            },
            {
                "barcode": f"SPL{uuid.uuid4().hex[:8].upper()}",
                "base_weight": 1000.0,
                "is_box": False,
                "thickness": 1.75,
                "spool_return": False,
                "material": materials[1],  # ABS
                "brand": brands[2],  # eSUN
                "color": colors[2],  # Red
                "trade_name": None,
                "category": categories[1],  # Engineering
            },
            {
                "barcode": f"SPL{uuid.uuid4().hex[:8].upper()}",
                "base_weight": 1000.0,
                "is_box": True,
                "thickness": 1.75,
                "spool_return": True,
                "material": materials[2],  # PETG
                "brand": brands[3],  # Hatchbox
                "color": colors[3],  # Blue
                "trade_name": None,
                "category": categories[1],  # Engineering
            },
            {
                "barcode": f"SPL{uuid.uuid4().hex[:8].upper()}",
                "base_weight": 500.0,
                "is_box": False,
                "thickness": 1.75,
                "spool_return": False,
                "material": materials[3],  # TPU
                "brand": brands[1],  # Polymaker
                "color": colors[5],  # Yellow
                "trade_name": None,
                "category": categories[3],  # Flexible
            },
        ]

        spools = []
        for spool_data in spools_data:
            spool = Spool(
                id=str(uuid.uuid4()),
                barcode=spool_data["barcode"],
                base_weight=spool_data["base_weight"],
                is_box=spool_data["is_box"],
                thickness=spool_data["thickness"],
                spool_return=spool_data["spool_return"],
                material_id=spool_data["material"].id,
                brand_id=spool_data["brand"].id,
                color_id=spool_data["color"].id,
                trade_name_id=(
                    spool_data["trade_name"].id if spool_data["trade_name"] else None
                ),
                category_id=(
                    spool_data["category"].id if spool_data["category"] else None
                ),
            )
            spools.append(spool)

        db.add_all(spools)
        db.flush()
        print(f"  ✅ Created {len(spools)} spool types (catalog)")

        # Create Inventory items (physical stock)
        inventory_items = [
            # 2 units of Prusament Black PLA
            Inventory(
                id=str(uuid.uuid4()),
                spool_id=spools[0].id,
                weight=1000.0,
                is_in_use=False,
                status_id=statuses[0].id,  # in_stock
            ),
            Inventory(
                id=str(uuid.uuid4()),
                spool_id=spools[0].id,
                weight=850.0,  # Partially used
                is_in_use=True,
                status_id=statuses[1].id,  # in_use
            ),
            # 1 unit of Polymaker White PLA
            Inventory(
                id=str(uuid.uuid4()),
                spool_id=spools[1].id,
                weight=1000.0,
                is_in_use=False,
                status_id=statuses[0].id,  # in_stock
            ),
            # 1 unit of eSUN Red ABS (in use)
            Inventory(
                id=str(uuid.uuid4()),
                spool_id=spools[2].id,
                weight=750.0,
                is_in_use=True,
                status_id=statuses[1].id,  # in_use
            ),
            # 3 units of Hatchbox Blue PETG
            Inventory(
                id=str(uuid.uuid4()),
                spool_id=spools[3].id,
                weight=1000.0,
                is_in_use=False,
                status_id=statuses[0].id,  # in_stock
            ),
            Inventory(
                id=str(uuid.uuid4()),
                spool_id=spools[3].id,
                weight=1000.0,
                is_in_use=False,
                status_id=statuses[0].id,  # in_stock
            ),
            Inventory(
                id=str(uuid.uuid4()),
                spool_id=spools[3].id,
                weight=200.0,  # Almost depleted
                is_in_use=False,
                status_id=statuses[2].id,  # depleted
            ),
        ]

        db.add_all(inventory_items)
        db.commit()
        print(f"  ✅ Created {len(inventory_items)} inventory items")
        print("✅ Database seeded successfully!")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
