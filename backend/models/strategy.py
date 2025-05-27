# backend/models/strategy.py
from pydantic import BaseModel
from typing import Literal, Optional


class Inputs(BaseModel):
    ticker: str
    start_date: str 
    end_date: str
    strategy: Literal["sma", "rsi", "ema"]
    fast: Optional[int] = None
    slow: Optional[int] = None
    period: Optional[int] = None
