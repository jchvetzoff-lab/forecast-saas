/**
 * Dataset de demo : 36 mois de demande d'un importateur de composants electroniques
 *
 * Pattern calque sur les donnees SupChains du prof :
 * - Saisonnalite TRES marquee (creux Q1 ~800, pic Q4 ~1600)
 * - Tendance haussiere +3%/mois
 * - Choc exogene brutal (Oct-Dec 24 : -50%)
 * - Le Naive rate les virages saisonniers
 * - Le MA lisse et retarde
 * - OmniCast anticipe le choc 2 mois avant via signal GDELT
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
  // 2023 — pattern saisonnier clair comme dans le cours (pic noel, creux ete)
   820,  780,  920, 1050, 1120, 1000,   // Jan-Jun : creux hivernal → remontee printemps
   950,  880, 1100, 1350, 1520, 1620,   // Jul-Dec : creux ete → pic Q4
  // 2024 — meme saisonnalite, croissance, puis CHOC
   900,  860, 1020, 1180, 1250, 1120,   // Jan-Jun : meme pattern
  1060, 1000, 1220,  620,  450,  380,   // Jul-Sep normal → CHOC Oct-Nov-Dec (sanctions + Suez)
  // 2025 — reprise lente puis rattrapage
   420,  550,  780, 1020, 1280, 1200,   // Reprise progressive Q1-Q2
  1140, 1080, 1350, 1620, 1780, 1880,   // Retour a la normale + rattrapage Q3-Q4
]

/** Index du debut et fin de la periode de choc */
export const SHOCK_START = 21 // Oct 24
export const SHOCK_END = 28   // Mai 25

/** Description du choc pour l'affichage */
export const SHOCK_DESCRIPTION = "Crise supply chain : sanctions semi-conducteurs (Oct 24) + blocage Canal de Suez (Nov 24) — demande divisee par 3"
