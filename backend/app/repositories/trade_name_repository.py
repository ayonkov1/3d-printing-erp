from typing import Optional
from sqlalchemy.orm import Session

from app.models.trade_name import TradeName
from app.repositories.base import BaseRepository


class TradeNameRepository(BaseRepository[TradeName]):
    def __init__(self, db: Session):
        super().__init__(TradeName, db)

    def find_by_name(self, name: str) -> Optional[TradeName]:
        """Find trade name by name (case-insensitive)"""
        return self.db.query(TradeName).filter(TradeName.name.ilike(name)).first()

    def find_or_create(self, name: str) -> TradeName:
        """Find existing trade name or create new one"""
        trade_name = self.find_by_name(name)
        if trade_name:
            return trade_name

        new_trade_name = TradeName(name=name)
        return self.create(new_trade_name)
