"use client"

const ITEMS = [
  "Sundial -- Tsinghua ICML 2025",
  "MiroFish -- 53K+ Stars",
  "Chronos-2 -- Amazon",
  "MAPIE -- Conformal Prediction",
  "GDELT -- Temps Reel",
  "DoWhy -- Inference Causale",
  "HierarchicalForecast -- Nixtla",
]

function MarqueeContent() {
  return (
    <>
      {ITEMS.map((item, index) => (
        <span key={index} className="flex items-center shrink-0 gap-8">
          <span>{item}</span>
          <span
            className="block w-[3px] h-[3px] rounded-full"
            style={{ backgroundColor: "#8E8EA0" }}
            aria-hidden="true"
          />
        </span>
      ))}
    </>
  )
}

export default function Marquee() {
  return (
    <div
      className="w-full overflow-hidden border-t border-b"
      style={{ borderColor: "#E5E5E5" }}
    >
      <div
        className="flex items-center gap-8 py-4 whitespace-nowrap"
        style={{
          fontSize: ".7rem",
          letterSpacing: "3px",
          color: "#8E8EA0",
          textTransform: "uppercase",
          fontWeight: 250,
          animation: "marquee-scroll 40s linear infinite",
        }}
      >
        <MarqueeContent />
        <MarqueeContent />
        <MarqueeContent />
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  )
}
