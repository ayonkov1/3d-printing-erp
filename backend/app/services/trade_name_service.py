from typing import List
from app.repositories.trade_name_repository import TradeNameRepository
from app.models.trade_name import TradeName


class TradeNameService:
    """Business logic for trade names"""

    def __init__(self, trade_name_repo: TradeNameRepository):
        self.trade_name_repo = trade_name_repo

    def get_all_trade_names(self, skip: int = 0, limit: int = 100) -> List[TradeName]:
        """Get all trade names with pagination"""
        return self.trade_name_repo.get_all(skip, limit)

    def get_trade_name_by_id(self, trade_name_id: str) -> TradeName:
        """Get a trade name by ID"""
        trade_name = self.trade_name_repo.get_by_id(trade_name_id)
        if not trade_name:
            raise ValueError(f"Trade name with id {trade_name_id} not found")
        return trade_name

    def create_trade_name(self, name: str) -> TradeName:
        """Create a new trade name"""
        existing = self.trade_name_repo.find_by_name(name)
        if existing:
            raise ValueError(f"Trade name '{name}' already exists")

        new_trade_name = TradeName(name=name)
        return self.trade_name_repo.create(new_trade_name)

    def find_or_create(self, name: str) -> TradeName:
        return self.trade_name_repo.find_or_create(name)
