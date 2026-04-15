"use client"

import { useCallback } from "react"

interface CsvData {
  labels: string[]
  demand: number[]
}

export default function CsvUploader({
  onData,
}: {
  onData: (data: CsvData) => void
}) {
  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const lines = text.trim().split("\n")
        const labels: string[] = []
        const demand: number[] = []

        // Detecter le separateur (virgule ou point-virgule)
        const sep = lines[0].includes(";") ? ";" : ","

        // Ignorer le header
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(sep).map((s) => s.trim())
          if (parts.length >= 2) {
            labels.push(parts[0])
            const val = parseFloat(parts[1].replace(",", "."))
            if (!isNaN(val)) demand.push(val)
            else labels.pop() // Retirer le label si la valeur est invalide
          }
        }

        if (demand.length >= 6) {
          onData({ labels, demand })
        } else {
          alert("Le CSV doit contenir au moins 6 periodes. Format attendu :\ndate,demand\nJan 23,1200\nFev 23,1350")
        }
      }
      reader.readAsText(file)
    },
    [onData]
  )

  return (
    <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 text-center hover:border-[#2563EB]/30 transition-colors">
      <input
        type="file"
        accept=".csv,.tsv,.txt"
        onChange={handleFile}
        className="hidden"
        id="csv-upload"
      />
      <label
        htmlFor="csv-upload"
        className="cursor-pointer flex flex-col items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] text-xl">
          +
        </div>
        <div>
          <p className="text-sm font-medium">Uploader un CSV</p>
          <p className="text-xs text-[#8E8EA0] mt-1">
            Format : date,demand (une colonne date, une colonne valeur)
          </p>
        </div>
      </label>
    </div>
  )
}
