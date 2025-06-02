# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.strategy import Inputs
from fastapi import APIRouter
from fastapi import HTTPException
from services.data import get_stock_data
from strategies.sma import sma_strategy
from strategies.ema import ema_strategy
from strategies.rsi import rsi_strategy
from strategies.bollinger import bollinger_strategy
from services.metrics import get_metrics
from strategies.macd import macd_strategy
from strategies.custom import custom_strategy
from datetime import datetime   
import numpy as np


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Trading Strategy Simulator API!"}


@app.post("/backtest")
def run_backtest(inputs: Inputs):
    try:
        df = get_stock_data(inputs.ticker, inputs.start_date, inputs.end_date)
        price_data = df.reset_index().to_dict(orient="records")
        if df is None or df.empty:
            raise HTTPException(status_code=400, detail="Invalid ticker or no data available.")


        if isinstance(df.columns[0], tuple):
            df.columns = ["_".join(filter(None, map(str, col))) for col in df.columns]
        df = df.reset_index()

        preview_df = df.head(5).reset_index()
        preview_records = preview_df.astype(str).to_dict(orient="records")
        full_records = df.astype(str).to_dict(orient="records")
        spy_overlay = (
            df[["Date", "Close_SPY"]]
            .dropna()
            .rename(columns={"Date": "date", "Close_SPY": "price"})
            .astype({"date": str, "price": float})
            .to_dict(orient="records")
        )

        signals = []
        metrics = {}
        indicator_series = []

        for col in df.columns:
            if "Close" in col:
                df = df.rename(columns={col: "Close"})
                break
                

        if inputs.strategy == "sma":
            signals, indicator_series = sma_strategy(df, inputs.fast, inputs.slow)
        elif inputs.strategy == "ema":
            signals, indicator_series = ema_strategy(df, inputs.fast, inputs.slow)
        elif inputs.strategy == "rsi":
            signals, indicator_series = rsi_strategy(df, inputs.period)
        elif inputs.strategy == "bollinger":
            period = inputs.period
            multiplier = inputs.multiplier
            if not period or not multiplier:
                raise HTTPException(status_code=400, detail="Bollinger parameters missing")
            signals, indicator_series = bollinger_strategy(df, period, multiplier)
        elif inputs.strategy == "macd":
            signals, indicator_series = macd_strategy(df)
        elif inputs.strategy == "custom":
            if not inputs.fast or not inputs.slow or not inputs.stop_loss or not inputs.take_profit:
                raise HTTPException(status_code=400, detail="Custom strategy parameters missing")
            signals, indicator_series = custom_strategy(df, inputs.fast, inputs.slow, inputs.stop_loss, inputs.take_profit)


        metrics = get_metrics(signals, df)
        spy_return = df["Close_SPY"].iloc[-1] / df["Close_SPY"].iloc[0] - 1
        strategy_return = metrics.get("total_return", 0) / 100
        delta_return = (strategy_return - spy_return) * 100


        response = {
            "ticker": inputs.ticker,
            "start_date": inputs.start_date,
            "end_date": inputs.end_date,
            "row_count": len(df),
            "columns": preview_df.columns.tolist(),
            "preview": preview_records,
            "price_data": full_records,
            "signals": signals,
            "metrics": metrics,
            "indicators": indicator_series,
            "strategy": inputs.strategy,
            "spy_overlay": spy_overlay,
            "spy_delta_return": round(delta_return, 2),
        }

        return response

    except Exception as e:
        print("ERROR:", repr(e))
        return {"error": str(e)}
