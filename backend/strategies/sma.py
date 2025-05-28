import pandas as pd
from typing import List, Dict, Union


def sma_strategy(
    df: pd.DataFrame, fast: int, slow: int
) -> List[Dict[str, Union[str, float]]]:
    df = df.reset_index()
    df["Close"] = pd.to_numeric(df["Close"], errors="coerce")

    df["SMA_fast"] = df["Close"].rolling(window=fast).mean()
    df["SMA_slow"] = df["Close"].rolling(window=slow).mean()

    signals = []
    for i in range(1, len(df)):
        prev_fast = df.loc[i - 1, "SMA_fast"]
        prev_slow = df.loc[i - 1, "SMA_slow"]
        curr_fast = df.loc[i, "SMA_fast"]
        curr_slow = df.loc[i, "SMA_slow"]

        if (
            pd.notna(prev_fast)
            and pd.notna(prev_slow)
            and pd.notna(curr_fast)
            and pd.notna(curr_slow)
        ):
            if prev_fast < prev_slow and curr_fast > curr_slow:
                # Buy signal
                signals.append(
                    {
                        "type": "buy",
                        "date": str(df.loc[i, "Date"]),
                        "price": float(df.loc[i, "Close"]),
                    }
                )
            elif prev_fast > prev_slow and curr_fast < curr_slow:
                # Sell signal
                signals.append(
                    {
                        "type": "sell",
                        "date": str(df.loc[i, "Date"]),
                        "price": float(df.loc[i, "Close"]),
                    }
                )
    indicator_series = [{
        "date": str(df.loc[i,"Date"]),
        "fast": df.loc[i,"SMA_fast"],
        "slow": df.loc[i,"SMA_slow"]
        }
        for i in range (len(df))
        if pd.notna(df.loc[i, "SMA_fast"]) and pd.notna(df.loc[i, "SMA_slow"])
    ]

    return signals, indicator_series
