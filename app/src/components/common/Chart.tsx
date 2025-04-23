import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

type ChartEntry = {
  date: Date
  value: number
  monthLabel: string
  isPhantom?: boolean
}

export default function Chart({ data }: { data: Record<string, number> }) {
  const formattedData: ChartEntry[] = Object.entries(data)
    .map(([dateStr, value]) => {
      const date = new Date(dateStr)
      return {
        date,
        value,
        monthLabel: date.toLocaleString("default", { month: "short" }),
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const insertMonthlyPhantoms = (data: ChartEntry[]) => {
    const seenMonths = new Set<string>()
    const result: ChartEntry[] = []

    for (let entry of data) {
      const key = `${entry.date.getFullYear()}-${entry.date.getMonth()}`
      if (!seenMonths.has(key)) {
        seenMonths.add(key)
        const phantomDate = new Date(
          entry.date.getFullYear(),
          entry.date.getMonth(),
          1,
        )
        result.push({
          date: phantomDate,
          value: 0,
          monthLabel: phantomDate.toLocaleString("default", { month: "short" }),
          isPhantom: true,
        })
      }
      result.push(entry)
    }

    return result
  }

  const fillMissingDates = (data: ChartEntry[]): ChartEntry[] => {
    if (data.length === 0) return []

    const result: ChartEntry[] = []

    for (let i = 0; i < data.length; i++) {
      result.push(data[i])

      const currentDate = new Date(data[i].date)
      const nextDate = data[i + 1]?.date

      // Only fill if next date is within 3 days of end of month
      if (nextDate) {
        const daysInMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        ).getDate()
        const daysRemaining = daysInMonth - currentDate.getDate()

        if (daysRemaining <= 3) {
          let expectedDate = new Date(currentDate)
          expectedDate.setDate(expectedDate.getDate() + 1)

          while (nextDate && expectedDate < nextDate) {
            result.push({
              date: new Date(expectedDate),
              value: 0,
              monthLabel: expectedDate.toLocaleString("default", {
                month: "short",
              }),
              isPhantom: true,
            })
            expectedDate.setDate(expectedDate.getDate() + 1)
          }
        }
      }
    }

    const last = result[result.length - 1]
    const daysInMonth = new Date(
      last.date.getFullYear(),
      last.date.getMonth() + 1,
      0,
    ).getDate()
    const daysRemaining = daysInMonth - last.date.getDate()

    // Only add next month's phantom entry if we're within 3 days of the end of the month
    if (daysRemaining <= 3) {
      const nextMonth = new Date(
        last.date.getFullYear(),
        last.date.getMonth() + 1,
        1,
      )

      result.push({
        date: nextMonth,
        value: 0,
        monthLabel: nextMonth.toLocaleString("default", { month: "short" }),
        isPhantom: true,
      })
    }

    return result
  }

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

  const withPhantomMonthlyStart = insertMonthlyPhantoms(formattedData)
  const filledChartData = fillMissingDates(withPhantomMonthlyStart)
  const chartData =
    filledChartData.length > 0 ? filledChartData : generateEmptyChart()

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
