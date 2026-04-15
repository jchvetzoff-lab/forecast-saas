"""
Moteur de forecasting — statsforecast + MAPIE
"""

import numpy as np
from statsforecast import StatsForecast
from statsforecast.models import (
    AutoETS,
    AutoARIMA,
    SeasonalNaive,
)


def run_forecasts(demand: list[float], horizon: int = 6) -> dict:
    """
    Lance AutoETS, AutoARIMA et SeasonalNaive via statsforecast
    Retourne les forecasts + metriques + intervalles de confiance
    """
    import pandas as pd

    n = len(demand)
    values = np.array(demand, dtype=np.float32)

    # Construire le DataFrame au format statsforecast
    df = pd.DataFrame({
        "unique_id": ["series_1"] * n,
        "ds": pd.date_range(start="2023-01-01", periods=n, freq="MS"),
        "y": values,
    })

    # Modeles
    models = [
        AutoETS(season_length=12),
        AutoARIMA(season_length=12),
        SeasonalNaive(season_length=12),
    ]

    sf = StatsForecast(models=models, freq="MS", n_jobs=1)
    sf.fit(df)

    # Forecast
    forecast_df = sf.predict(h=horizon, level=[90])

    result = {
        "horizon": horizon,
        "models": {},
    }

    for col in forecast_df.columns:
        if col in ("unique_id", "ds"):
            continue
        result["models"][col] = forecast_df[col].tolist()

    # Ajouter les dates de forecast
    result["dates"] = forecast_df["ds"].dt.strftime("%Y-%m").tolist()

    return result


def compute_confidence_intervals(
    demand: list[float],
    forecast: list[float],
    alpha: float = 0.1,
) -> dict:
    """
    Prediction conforme (MAPIE simplifie) :
    1. Calculer les residus |f(t) - d(t)| sur l'historique
    2. Prendre le quantile (1-alpha) des residus
    3. Appliquer comme bande symetrique autour du forecast

    Garantie : couverture marginale >= 1-alpha (theoreme)
    """
    demand_arr = np.array(demand, dtype=np.float64)
    forecast_arr = np.array(forecast, dtype=np.float64)

    # On ne prend que les indices ou les deux existent
    min_len = min(len(demand_arr), len(forecast_arr))
    demand_arr = demand_arr[:min_len]
    forecast_arr = forecast_arr[:min_len]

    # Residus absolus (ignorer le premier point)
    residuals = np.abs(forecast_arr[1:] - demand_arr[1:])

    if len(residuals) == 0:
        return {"upper": forecast, "lower": forecast, "width": 0, "coverage_target": 1 - alpha}

    # Quantile conforme : (1-alpha) * (1 + 1/n)
    n = len(residuals)
    q = min((1 - alpha) * (1 + 1 / n), 1.0)
    half_width = float(np.quantile(residuals, q))

    upper = (forecast_arr + half_width).tolist()
    lower = (forecast_arr - half_width).tolist()

    return {
        "upper": upper,
        "lower": lower,
        "width": half_width,
        "coverage_target": 1 - alpha,
        "n_residuals": n,
        "method": "conformal_prediction",
    }
