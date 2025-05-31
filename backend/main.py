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
from datetime import datetime   


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can change this to your frontend URL later
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
        if df is None or df.empty:
            raise HTTPException(status_code=400, detail="Invalid ticker or no data available.")


        # Flatten MultiIndex columns if needed
        if isinstance(df.columns[0], tuple):
            df.columns = ["_".join(filter(None, map(str, col))) for col in df.columns]
        df = df.reset_index()

        preview_df = df.head(5).reset_index()
        preview_records = preview_df.astype(str).to_dict(orient="records")
        full_records = df.astype(str).to_dict(orient="records")

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
        else:
            raise HTTPException(status_code=400, detail="Unsupported strategy")

        metrics = get_metrics(signals, df)

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
        }

        return response

    except Exception as e:
        print("ERROR:", repr(e))
        return {"error": str(e)}
