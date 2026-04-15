"use client"


/* ---------- Pseudo-code OmniCast ---------- */

type TokenType = "comment" | "keyword" | "function" | "string" | "number" | "plain"

interface Token {
  type: TokenType
  text: string
}

interface CodeLine {
  indent: number
  tokens: Token[]
}

const couleurs: Record<TokenType, string> = {
  comment: "rgba(255,255,255,.25)",
  keyword: "#c084fc",
  function: "#60a5fa",
  string: "#34d399",
  number: "#fbbf24",
  plain: "rgba(255,255,255,.7)",
}

const lignes: CodeLine[] = [
  {
    indent: 0,
    tokens: [{ type: "comment", text: "// OmniCast — Fusion bayesienne multi-couches" }],
  },
  {
    indent: 0,
    tokens: [
      { type: "keyword", text: "function " },
      { type: "function", text: "omnicast" },
      { type: "plain", text: "(signals, models, agents, markets) {" },
    ],
  },
  { indent: 0, tokens: [] },
  {
    indent: 1,
    tokens: [
      { type: "comment", text: "// 1. Normaliser les distributions de probabilite" },
    ],
  },
  {
    indent: 1,
    tokens: [
      { type: "keyword", text: "const " },
      { type: "plain", text: "priors = " },
      { type: "function", text: "normalize" },
      { type: "plain", text: "([" },
    ],
  },
  {
    indent: 2,
    tokens: [
      { type: "plain", text: "signals." },
      { type: "function", text: "toProbDist" },
      { type: "plain", text: "()," },
    ],
  },
  {
    indent: 2,
    tokens: [
      { type: "plain", text: "models." },
      { type: "function", text: "forecast" },
      { type: "plain", text: "(horizon: " },
      { type: "string", text: "'Q3'" },
      { type: "plain", text: ")," },
    ],
  },
  {
    indent: 2,
    tokens: [
      { type: "plain", text: "agents." },
      { type: "function", text: "consensus" },
      { type: "plain", text: "(n: " },
      { type: "number", text: "1000" },
      { type: "plain", text: ")," },
    ],
  },
  {
    indent: 2,
    tokens: [
      { type: "plain", text: "markets." },
      { type: "function", text: "calibrate" },
      { type: "plain", text: "()" },
    ],
  },
  {
    indent: 1,
    tokens: [{ type: "plain", text: "])" }],
  },
  { indent: 0, tokens: [] },
  {
    indent: 1,
    tokens: [
      { type: "comment", text: "// 2. Inference bayesienne avec poids adaptatifs" },
    ],
  },
  {
    indent: 1,
    tokens: [
      { type: "keyword", text: "const " },
      { type: "plain", text: "posterior = " },
      { type: "function", text: "bayesianFusion" },
      { type: "plain", text: "(priors, {" },
    ],
  },
  {
    indent: 2,
    tokens: [
      { type: "plain", text: "weights: " },
      { type: "function", text: "adaptiveWeights" },
      { type: "plain", text: "(priors)," },
    ],
  },
  {
    indent: 2,
    tokens: [
      { type: "plain", text: "coherence: " },
      { type: "function", text: "interModelAgreement" },
      { type: "plain", text: "(priors)," },
    ],
  },
  {
    indent: 2,
    tokens: [
      { type: "plain", text: "decay: " },
      { type: "number", text: "0.94" },
    ],
  },
  {
    indent: 1,
    tokens: [{ type: "plain", text: "})" }],
  },
  { indent: 0, tokens: [] },
  {
    indent: 1,
    tokens: [
      { type: "comment", text: "// 3. Score de confiance + recommandation" },
    ],
  },
  {
    indent: 1,
    tokens: [
      { type: "keyword", text: "return " },
      { type: "plain", text: "{" },
    ],
  },
  {
    indent: 2,
    tokens: [
      { type: "plain", text: "score: posterior." },
      { type: "function", text: "confidence" },
      { type: "plain", text: "()," },
    ],
  },
  {
    indent: 2,
    tokens: [
      { type: "plain", text: "action: posterior." },
      { type: "function", text: "recommend" },
      { type: "plain", text: "()," },
    ],
  },
  {
    indent: 2,
    tokens: [
      { type: "plain", text: "intervals: posterior." },
      { type: "function", text: "credibleIntervals" },
      { type: "plain", text: "([" },
      { type: "number", text: "0.5" },
      { type: "plain", text: ", " },
      { type: "number", text: "0.9" },
      { type: "plain", text: ", " },
      { type: "number", text: "0.99" },
      { type: "plain", text: "])" },
    ],
  },
  {
    indent: 1,
    tokens: [{ type: "plain", text: "}" }],
  },
  {
    indent: 0,
    tokens: [{ type: "plain", text: "}" }],
  },
]

export function AlgoBlock() {

  return (
    <section className="w-full max-w-[1280px] mx-auto px-6 py-32">
      {/* Titre de section */}
      <div className="mb-12">
        <p
          className="text-xs tracking-[0.2em] uppercase mb-4"
          style={{ color: "var(--text3)" }}
        >
          Algorithme
        </p>
        <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 200 }}>
          Moteur de{" "}
          <strong className="font-medium" style={{ fontWeight: 500 }}>
            Fusion
          </strong>
        </h2>
      </div>

      {/* Bloc de code */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "#1a1a2e" }}
      >
        {/* Barre superieure */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{ borderColor: "rgba(255,255,255,.06)" }}
        >
          {/* Points decoratifs */}
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: "rgba(255,255,255,.08)" }}
            />
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: "rgba(255,255,255,.08)" }}
            />
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: "rgba(255,255,255,.08)" }}
            />
          </div>

          {/* Label */}
          <span
            className="text-[10px] font-mono tracking-wider"
            style={{ color: "rgba(255,255,255,.25)" }}
          >
            OmniCast Algo v2.1
          </span>
        </div>

        {/* Code */}
        <div className="p-6 md:p-8 overflow-x-auto">
          <pre className="font-mono text-sm leading-7">
            {lignes.map((ligne, i) => (
              <div key={i} className="min-h-[1.75rem]">
                {/* Numero de ligne */}
                <span
                  className="inline-block w-8 mr-6 text-right select-none"
                  style={{ color: "rgba(255,255,255,.15)" }}
                >
                  {i + 1}
                </span>

                {/* Indentation */}
                {ligne.indent > 0 && (
                  <span>{"\u00A0".repeat(ligne.indent * 2)}</span>
                )}

                {/* Tokens */}
                {ligne.tokens.map((token, j) => (
                  <span key={j} style={{ color: couleurs[token.type] }}>
                    {token.text}
                  </span>
                ))}
              </div>
            ))}
          </pre>
        </div>
      </div>
    </section>
  )
}
