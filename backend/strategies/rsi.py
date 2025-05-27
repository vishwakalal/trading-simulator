import pandas as pd
from typing import List, Dict, Union


def rsi_strategy(
    df: pd.DataFrame, period: int = 14
) -> List[Dict[str, Union[str, float]]]:
    df = df.reset_index()
    df["Close"] = pd.to_numeric(df["Close"], errors="coerce")

    delta = df["Close"].diff()
    gain = []
    for change in delta:
        if pd.notna(change):
            if change > 0:
                gain.append(change)
            else:
                gain.append(0.0)
        else:
            gain.append(0.0)

    gain = pd.Series(gain)

    loss = []
    for change in delta:
        if pd.notna(change):
            if change < 0:
                loss.append(-change)
            else:
                loss.append(0.0)
        else:
            loss.append(0.0)

    loss = pd.Series(loss)

    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    relative_strength = avg_gain / avg_loss
    df["RSI"] = 100 - (100 / (1 + relative_strength))

    signals = []
    for i in range(1, len(df)):
        prev_rsi = df.loc[i - 1, "RSI"]
        curr_rsi = df.loc[i, "RSI"]

        if pd.notna(prev_rsi) and pd.notna(curr_rsi):
            if prev_rsi > 30 and curr_rsi <= 30:
                signals.append(
                    {
                        "type": "buy",
                        "date": str(df.loc[i, "Date"]),
                        "price": float(df.loc[i, "Close"]),
                    }
                )
            elif prev_rsi < 70 and curr_rsi >= 70:
                signals.append(
                    {
                        "type": "sell",
                        "date": str(df.loc[i, "Date"]),
                        "price": float(df.loc[i, "Close"]),
                    }
                )

    return signals
