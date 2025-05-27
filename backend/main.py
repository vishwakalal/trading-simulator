# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.strategy import Inputs
from fastapi import APIRouter
from services.data import get_stock_data
from strategies.sma import sma_strategy
from strategies.ema import ema_strategy
from strategies.rsi import rsi_strategy
from services.metrics import get_metrics


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

        # Flatten MultiIndex columns if needed
        if isinstance(df.columns[0], tuple):
            df.columns = ["_".join(filter(None, map(str, col))) for col in df.columns]
            df = df.reset_index()

        preview_df = df.head(5).reset_index()
        preview_records = preview_df.astype(str).to_dict(orient="records")

        print("Preview Columns:", preview_df.columns.tolist())
        print("Preview Records:", preview_records)
        signals = []
        metrics = {}
        if inputs.strategy in ["sma", "ema", "rsi"]:
            for col in df.columns:
                if "Close" in col:
                    df = df.rename(columns={col: "Close"})
                    break
            if inputs.strategy == "sma":
                signals = sma_strategy(df, inputs.fast, inputs.slow)
            if inputs.strategy == "ema":
                signals = ema_strategy(df, inputs.fast, inputs.slow)
            if inputs.strategy == "rsi":
                signals = rsi_strategy(df)
            metrics = get_metrics(signals, df)

        response = {
            "ticker": inputs.ticker,
            "row_count": len(df),
            "columns": preview_df.columns.tolist(),
            "preview": preview_records,
            "signals": signals,
            "metrics": metrics,
        }

        return response

    except Exception as e:
        print("ERROR:", e)
        return {"error": str(e)}
