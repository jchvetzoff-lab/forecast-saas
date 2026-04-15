"""
OmniCast Backend — FastAPI
Endpoints : /predict, /simulate, /confidence, /health
Tourne en local (dev) ou sur Render (prod)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

from forecasting_engine import run_forecasts, compute_confidence_intervals
from simulation_engine import simulate_agents

app = FastAPI(title="OmniCast Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    demand: list[float]
    horizon: int = 6


class SimulateRequest(BaseModel):
    event_description: str
    event_severity: float = 0.5  # 0-1
    demand_context: list[float] = []


class ConfidenceRequest(BaseModel):
    demand: list[float]
    forecast: list[float]
    alpha: float = 0.1  # 90% de couverture


@app.get("/health")
def health():
    return {"status": "ok", "service": "omnicast-backend", "version": "1.0.0"}


@app.post("/predict")
def predict(req: PredictRequest):
    """
    Forecast via statsforecast (AutoETS, AutoARIMA, SeasonalNaive)
    + intervalles de confiance MAPIE
    """
    result = run_forecasts(req.demand, req.horizon)
    return result


@app.post("/confidence")
def confidence(req: ConfidenceRequest):
    """
    Intervalles de confiance via prediction conforme (MAPIE)
    """
    intervals = compute_confidence_intervals(
        req.demand, req.forecast, req.alpha
    )
    return intervals


@app.post("/simulate")
def simulate(req: SimulateRequest):
    """
    Simulation multi-agents (fournisseurs, clients, concurrents)
    via Ollama (Gemma4 local) ou regles deterministes en fallback
    """
    result = simulate_agents(
        event_description=req.event_description,
        event_severity=req.event_severity,
        demand_context=req.demand_context,
    )
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
