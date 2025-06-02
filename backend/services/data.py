import yfinance as yf
import pandas as pd

def get_stock_data(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    try:
        main = yf.download(ticker, start=start_date, end=end_date, progress=False, auto_adjust=False)
        spy = yf.download("SPY", start=start_date, end=end_date, progress=False, auto_adjust=False)

        if main.empty or spy.empty:
            raise ValueError("No data found for ticker or SPY.")

        if isinstance(main.columns, pd.MultiIndex):
            main.columns = ["_".join(col).strip() for col in main.columns]
        if isinstance(spy.columns, pd.MultiIndex):
            spy.columns = ["_".join(col).strip() for col in spy.columns]

        main = main.reset_index()
        spy = spy.reset_index()
        main = main.rename(columns=lambda c: c if ticker.upper() in c or c == "Date" else f"{c}_{ticker.upper()}")


        spy = spy.rename(columns={"Close": "Close_SPY"})
        spy = spy[["Date", "Close_SPY"]]

        combined = pd.merge(main, spy, on="Date", how="left")
        if "Close_SPY" not in combined.columns:
            raise ValueError("SPY close price missing after merge.")

        return combined

    except Exception as e:
        raise ValueError(f"Failed to fetch data: {e}")
