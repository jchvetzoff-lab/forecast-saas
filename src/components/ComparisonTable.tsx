"use client"

interface MetriqueRow {
  label: string
  mlClassique: string
  omnicast: string
}

const DONNEES: MetriqueRow[] = [
  { label: "MAPE normal", mlClassique: "8.2%", omnicast: "6.1%" },
  { label: "MAPE choc", mlClassique: "23.7%", omnicast: "11.4%" },
  { label: "Detection anomalie", mlClassique: "+12h", omnicast: "-2.4h avant" },
  { label: "Faux positifs", mlClassique: "14", omnicast: "6" },
]

export function ComparisonTable() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse" style={{ fontSize: ".85rem" }}>
        <thead>
          <tr>
            <th
              className="text-left py-3 px-4"
              style={{
                fontWeight: 400,
                color: "var(--text3)",
                fontSize: ".75rem",
                letterSpacing: ".04em",
                textTransform: "uppercase",
                borderBottom: "1px solid var(--border)",
              }}
            >
              Metrique
            </th>
            <th
              className="text-left py-3 px-4"
              style={{
                fontWeight: 400,
                color: "var(--text3)",
                fontSize: ".75rem",
                letterSpacing: ".04em",
                textTransform: "uppercase",
                borderBottom: "1px solid var(--border)",
              }}
            >
              ML Classique
            </th>
            <th
              className="text-left py-3 px-4"
              style={{
                fontWeight: 400,
                color: "var(--text3)",
                fontSize: ".75rem",
                letterSpacing: ".04em",
                textTransform: "uppercase",
                borderBottom: "1px solid var(--border)",
              }}
            >
              OmniCast
            </th>
          </tr>
        </thead>
        <tbody>
          {DONNEES.map((row, index) => (
            <tr
              key={index}
              className="transition-colors duration-150"
              style={{
                borderBottom:
                  index < DONNEES.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <td
                className="py-3.5 px-4"
                style={{
                  fontWeight: 350,
                  color: "var(--foreground)",
                }}
              >
                {row.label}
              </td>
              <td
                className="py-3.5 px-4"
                style={{
                  fontWeight: 300,
                  color: "var(--text3)",
                }}
              >
                {row.mlClassique}
              </td>
              <td
                className="py-3.5 px-4"
                style={{
                  fontWeight: 600,
                  color: "#059669",
                }}
              >
                {row.omnicast}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
