/**
 * Dataset de demo : 36 mois de demande d'un importateur de composants electroniques
 *
 * Caracteristiques :
 * - Base ~1200 unites/mois
 * - Tendance haussiere ~2%/mois
 * - Saisonnalite (Q4 haut, Q1 bas)
 * - Choc en mois 24 (crise supply chain, -30%)
 * - Reprise progressive mois 25-30
 * - Bruit aleatoire realiste
 */

export const SAMPLE_LABELS: string[] = [
  "Jan 23", "Fev 23", "Mar 23", "Avr 23", "Mai 23", "Jun 23",
  "Jul 23", "Aou 23", "Sep 23", "Oct 23", "Nov 23", "Dec 23",
  "Jan 24", "Fev 24", "Mar 24", "Avr 24", "Mai 24", "Jun 24",
  "Jul 24", "Aou 24", "Sep 24", "Oct 24", "Nov 24", "Dec 24",
  "Jan 25", "Fev 25", "Mar 25", "Avr 25", "Mai 25", "Jun 25",
  "Jul 25", "Aou 25", "Sep 25", "Oct 25", "Nov 25", "Dec 25",
]

export const SAMPLE_DEMAND: number[] = [
  // 2023 — croissance reguliere + saisonnalite
  1050, 1080, 1150, 1200, 1250, 1220,   // Q1-Q2
  1180, 1210, 1320, 1450, 1520, 1580,   // Q3-Q4 (pic fin d'annee)
  // 2024 — croissance continue puis choc en Q4
  1180, 1220, 1310, 1380, 1420, 1390,   // Q1-Q2
  1350, 1400, 1510, 1620, 1680, 980,    // Q3 puis CHOC en Dec (crise Suez / sanctions)
  // 2025 — reprise progressive
  850,  920, 1050, 1180, 1320, 1380,    // Reprise lente Q1-Q2
  1420, 1480, 1560, 1650, 1720, 1800,   // Retour a la normale Q3-Q4
]

/** Index du debut et fin de la periode de choc */
export const SHOCK_START = 23 // Dec 24
export const SHOCK_END = 28   // Mai 25

/** Description du choc pour l'affichage */
export const SHOCK_DESCRIPTION = "Crise supply chain : blocage Canal de Suez + sanctions semi-conducteurs"
