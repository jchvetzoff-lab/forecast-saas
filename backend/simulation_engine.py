"""
Simulation multi-agents — MiroFish-inspired
Utilise Ollama (Gemma4 local) pour generer des reactions d'agents
Fallback deterministe si Ollama n'est pas disponible
"""

import httpx
import json
from typing import Optional


OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "gemma4:latest"


def simulate_agents(
    event_description: str,
    event_severity: float = 0.5,
    demand_context: list[float] = [],
) -> dict:
    """
    Simule 3 profils d'agents qui reagissent a un evenement supply chain.
    Utilise Ollama/Gemma4 pour generer des reactions realistes.
    """
    profiles = [
        {
            "name": "Fournisseurs",
            "role": "fournisseur de composants electroniques",
            "count": 812,
            "bias": "proteger ses marges, anticiper la penurie",
        },
        {
            "name": "Clients B2B",
            "role": "directeur achats d'une entreprise industrielle",
            "count": 1204,
            "bias": "securiser l'approvisionnement, negocier les prix",
        },
        {
            "name": "Concurrents",
            "role": "directeur strategie d'un concurrent direct",
            "count": 831,
            "bias": "exploiter la situation pour gagner des parts de marche",
        },
    ]

    results = []
    for profile in profiles:
        reaction = _get_agent_reaction(
            profile, event_description, event_severity, demand_context
        )
        results.append(reaction)

    # Score de consensus
    sentiments = [r["sentiment"] for r in results]
    consensus = sum(sentiments) / len(sentiments)

    return {
        "event": event_description,
        "severity": event_severity,
        "agents_total": sum(p["count"] for p in profiles),
        "profiles": results,
        "consensus": round(consensus, 2),
        "recommendation": _generate_recommendation(consensus, event_severity),
    }


def _get_agent_reaction(
    profile: dict,
    event: str,
    severity: float,
    demand_context: list[float],
) -> dict:
    """Demande a Ollama/Gemma4 de simuler la reaction d'un agent"""

    # Essayer Ollama d'abord
    llm_response = _call_ollama(profile, event, severity)

    if llm_response:
        return {
            "name": profile["name"],
            "count": profile["count"],
            "reaction": llm_response["reaction"],
            "sentiment": llm_response["sentiment"],
            "actions": llm_response["actions"],
            "source": "ollama-gemma4",
        }

    # Fallback deterministe
    return _deterministic_reaction(profile, event, severity)


def _call_ollama(
    profile: dict, event: str, severity: float
) -> Optional[dict]:
    """Appel Ollama avec un prompt structure"""

    prompt = f"""Tu es un {profile['role']}. Ton biais naturel : {profile['bias']}.

Un evenement supply chain vient de se produire :
"{event}"
Severite : {severity * 100:.0f}%

Reponds en JSON strict (pas de markdown) avec :
- "reaction" : ta reaction en 1-2 phrases (en francais)
- "sentiment" : un score entre -1 (tres negatif) et +1 (positif)
- "actions" : liste de 2-3 actions concretes que tu prendrais

Reponds UNIQUEMENT avec le JSON, rien d'autre."""

    try:
        response = httpx.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.7, "num_predict": 300},
            },
            timeout=30.0,
        )

        if response.status_code != 200:
            return None

        data = response.json()
        content = data.get("message", {}).get("content", "")

        parsed = json.loads(content)
        return {
            "reaction": parsed.get("reaction", "Pas de reaction"),
            "sentiment": max(-1, min(1, float(parsed.get("sentiment", 0)))),
            "actions": parsed.get("actions", []),
        }

    except (httpx.TimeoutException, json.JSONDecodeError, Exception):
        return None


def _deterministic_reaction(
    profile: dict, event: str, severity: float
) -> dict:
    """Fallback sans LLM — regles basees sur le profil et la severite"""

    reactions = {
        "Fournisseurs": {
            "reaction": f"Face a cet evenement (severite {severity*100:.0f}%), nous anticipons une hausse des couts de {severity*20:.0f}% et envisageons de reduire les volumes.",
            "sentiment": -0.3 - severity * 0.4,
            "actions": [
                f"Augmenter les prix de {severity*15:.0f}%",
                "Reduire les delais de paiement",
                "Prioriser les clients strategiques",
            ],
        },
        "Clients B2B": {
            "reaction": f"Nous devons securiser nos approvisionnements. Risque de rupture estime a {severity*60:.0f}%.",
            "sentiment": -0.2 - severity * 0.3,
            "actions": [
                "Passer des commandes anticipees",
                "Explorer des fournisseurs alternatifs",
                f"Constituer un stock tampon de {severity*4:.0f} semaines",
            ],
        },
        "Concurrents": {
            "reaction": f"Opportunite de marche detectee. Nos concurrents sont impactes, nous pouvons gagner {severity*15:.0f}% de parts de marche.",
            "sentiment": 0.1 + severity * 0.2,
            "actions": [
                "Lancer une campagne commerciale agressive",
                "Proposer des prix competitifs aux clients de nos concurrents",
                "Accelerer le R&D sur des alternatives",
            ],
        },
    }

    r = reactions.get(profile["name"], reactions["Clients B2B"])
    return {
        "name": profile["name"],
        "count": profile["count"],
        "reaction": r["reaction"],
        "sentiment": round(r["sentiment"], 2),
        "actions": r["actions"],
        "source": "deterministic-fallback",
    }


def _generate_recommendation(consensus: float, severity: float) -> str:
    """Genere une recommandation basee sur le consensus des agents"""

    if consensus < -0.4 and severity > 0.6:
        return "ALERTE : Constituer un stock tampon immediat. Diversifier les fournisseurs. Reporter les engagements de volume."
    elif consensus < -0.2:
        return "VIGILANCE : Surveiller les prix fournisseurs. Preparer des scenarios alternatifs. Anticiper les commandes critiques."
    elif consensus > 0.1:
        return "OPPORTUNITE : Position concurrentielle favorable. Envisager une expansion commerciale ciblee."
    else:
        return "STABLE : Maintenir le cap. Continuer la veille sur les signaux faibles."
