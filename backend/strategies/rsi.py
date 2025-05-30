import pandas as pd
from typing import List, Dict, Union

def rsi_strategy(df: pd.DataFrame, period: int = 14) -> (List[Dict[str, Union[str, float]]], List[Dict[str, Union[str, float]]]):
    if period is None or period <= 0:
        raise ValueError("Invalid RSI period. Must be a positive integer.")

    df = df.reset_index()

    df["Close"] = pd.to_numeric(df["Close"], errors="coerce")

    delta = df["Close"].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()

    rs = avg_gain / avg_loss.replace(0, pd.NA)
    df["RSI"] = 100 - (100 / (1 + rs))

    df = df.dropna(subset=["RSI"])

    signals = []
    for i in range(1, len(df)):
        prev = df.iloc[i - 1]["RSI"]
        curr = df.iloc[i]["RSI"]
        if pd.notna(prev) and pd.notna(curr):
            if prev > 30 and curr <= 30:
                signals.append({
                    "type": "buy",
                    "date": str(df.iloc[i]["Date"]),
                    "price": float(df.iloc[i]["Close"])
                })
            elif prev < 70 and curr >= 70:
                signals.append({
                    "type": "sell",
                    "date": str(df.iloc[i]["Date"]),
                    "price": float(df.iloc[i]["Close"])
                })


    indicator_series = [
        {"date": str(row["Date"]), "rsi": float(row["RSI"])}
        for _, row in df.iterrows()
    ]



    return signals, indicator_series
