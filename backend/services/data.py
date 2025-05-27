import yfinance as yf
import pandas as pd


def get_stock_data(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    try:
        data = yf.download(ticker, start=start_date, end=end_date, progress=False)
        if data.empty:
            raise ValueError("No data found for that ticker and date range.")
        return data
    except Exception as e:
        raise ValueError(f"Failed to fetch data: {e}")
