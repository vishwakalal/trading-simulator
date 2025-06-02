import pandas as pd
from typing import List, Dict, Union


def ema_strategy(
    df: pd.DataFrame, fast: int, slow: int
) -> List[Dict[str, Union[str, float]]]:

    df = df.reset_index()
    df["Close"] = pd.to_numeric(df["Close"], errors="coerce")

    df["EMA_fast"] = df["Close"].ewm(span=fast, adjust=False).mean()
    df["EMA_slow"] = df["Close"].ewm(span=slow, adjust=False).mean()
    df["date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")

    signals = []
    for i in range(1, len(df)):
        prev_fast = df.loc[i - 1, "EMA_fast"]
        prev_slow = df.loc[i - 1, "EMA_slow"]
        curr_fast = df.loc[i, "EMA_fast"]
        curr_slow = df.loc[i, "EMA_slow"]

        if (
            pd.notna(prev_fast)
            and pd.notna(prev_slow)
            and pd.notna(curr_fast)
            and pd.notna(curr_slow)
        ):
            if prev_fast < prev_slow and curr_fast > curr_slow:
                signals.append(
                    {
                        "type": "buy",
                        "date": df.loc[i, "date"],
                        "price": float(df.loc[i, "Close"]),
                    }
                )
            elif prev_fast > prev_slow and curr_fast < curr_slow:
                signals.append(
                    {
                        "type": "sell",
                        "date": df.loc[i, "date"],
                        "price": float(df.loc[i, "Close"]),
                    }
                )

    indicator_series = [
            {
                "date": df.loc[i, "date"],
                "fast": df.loc[i, "EMA_fast"],
                "slow": df.loc[i, "EMA_slow"]
            }
            for i in range(len(df))
            if pd.notna(df.loc[i, "EMA_fast"]) and pd.notna(df.loc[i, "EMA_slow"])
        ]
    return signals, indicator_series
