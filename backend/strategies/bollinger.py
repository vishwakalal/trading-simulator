import pandas as pd

def bollinger_strategy(df: pd.DataFrame, period: int, multiplier: float):
    df = df.copy()

    df["SMA"] = df["Close"].rolling(window=period).mean()
    df["STD"] = df["Close"].rolling(window=period).std()
    df["Upper"] = df["SMA"] + (multiplier * df["STD"])
    df["Lower"] = df["SMA"] - (multiplier * df["STD"])

    signals = []
    for i in range(1, len(df)):
        if df["Close"].iloc[i - 1] > df["Lower"].iloc[i - 1] and df["Close"].iloc[i] < df["Lower"].iloc[i]:
            signals.append({
                "type": "buy",
                "date": df["Date"].iloc[i].strftime("%Y-%m-%d"),
                "price": df["Close"].iloc[i],
            })
        elif df["Close"].iloc[i - 1] < df["Upper"].iloc[i - 1] and df["Close"].iloc[i] > df["Upper"].iloc[i]:
            signals.append({
                "type": "sell",
                "date": df["Date"].iloc[i].strftime("%Y-%m-%d"),
                "price": df["Close"].iloc[i],
            })

    df = df.reset_index()
    df["date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
    

    bollingerData = df[["date", "SMA", "Upper", "Lower"]].dropna()
    output = bollingerData.to_dict(orient="records")
    return signals, output
