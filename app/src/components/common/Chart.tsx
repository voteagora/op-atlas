import { formatNumber } from "@/lib/utils"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

type ChartEntry = {
  date: Date
  value: number
  monthLabel: string
  isPhantom?: boolean
}

type ChartData = Record<
  string,
  { value: number; trend: { value: number; sign: "inc" | "dec" | null } }
>

export default function Chart({ data }: { data: ChartData }) {
  const formattedData: ChartEntry[] = Object.entries(data)
    .map(([dateStr, { value }]) => {
      const date = new Date(dateStr)
      return {
        date,
        value,
        monthLabel: date.toLocaleString("default", { month: "short" }),
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const generateEmptyChart = (): ChartEntry[] => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    return Array.from({ length: month + 1 }, (_, i) => {
      const date = new Date(year, i, 1)
      return {
        date,
        value: 0,
        monthLabel: date.toLocaleString("default", { month: "short" }),
        isPhantom: true,
      }
    })
  }

  const chartData =
    formattedData.length > 0 ? formattedData : generateEmptyChart()

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th"
    switch (day % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={chartData} margin={{ left: 15, right: 15 }}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF99A1" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#FBFCFE" stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="monthLabel"
          interval={0}
          strokeWidth={0}
          fontSize={14}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value, index) => {
            const curr = chartData[index]
            const prev = chartData[index - 1]
            return prev?.monthLabel !== curr?.monthLabel ? value : ""
          }}
        />

        <Tooltip
          labelFormatter={(value: unknown, payload: any[]) => {
            const entry = payload?.[0]?.payload
            if (!entry || !entry.date) return ""
            const date = new Date(entry.date)
            const day = date.getDate()
            const month = date.toLocaleString("default", { month: "short" })
            return `${day}${getOrdinalSuffix(day)} of ${month}`
          }}
          formatter={(value: number) => formatNumber(value, 3, "compact")}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke="#FF0420"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
