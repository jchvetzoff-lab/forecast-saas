"use client"

type EventCategory = "critical" | "warning" | "info"

interface TimelineEvent {
  date: string
  title: string
  description: string
  category: EventCategory
}

interface EventTimelineProps {
  events: TimelineEvent[]
}

const DOT_COLORS: Record<EventCategory, string> = {
  critical: "#DC2626",
  warning: "#D97706",
  info: "#2563EB",
}

const DOT_BG: Record<EventCategory, string> = {
  critical: "rgba(220,38,38,.08)",
  warning: "rgba(217,119,6,.08)",
  info: "rgba(37,99,235,.08)",
}

export function EventTimeline({ events }: EventTimelineProps) {
  return (
    <div className="relative pl-8">
      {/* Ligne verticale */}
      <div
        className="absolute left-[11px] top-2 bottom-2 w-px"
        style={{ backgroundColor: "var(--border)" }}
      />

      <div className="flex flex-col gap-8">
        {events.map((event, index) => (
          <div key={index} className="relative">
            {/* Dot */}
            <div
              className="absolute -left-8 top-1 flex items-center justify-center"
              style={{ width: 22, height: 22 }}
            >
              <div
                className="rounded-full"
                style={{
                  width: 22,
                  height: 22,
                  backgroundColor: DOT_BG[event.category],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: DOT_COLORS[event.category],
                  }}
                />
              </div>
            </div>

            {/* Contenu */}
            <div className="flex flex-col gap-1">
              <span
                className="uppercase tracking-wider"
                style={{
                  fontSize: ".62rem",
                  color: "var(--text3)",
                  fontWeight: 400,
                  letterSpacing: ".08em",
                }}
              >
                {event.date}
              </span>
              <span
                style={{
                  fontSize: ".88rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                  lineHeight: 1.4,
                }}
              >
                {event.title}
              </span>
              <span
                style={{
                  fontSize: ".78rem",
                  fontWeight: 300,
                  color: "var(--text2)",
                  lineHeight: 1.5,
                }}
              >
                {event.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
