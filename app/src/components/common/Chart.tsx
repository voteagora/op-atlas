import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

import { EOM_DAYS_OFFSET, OSO_QUERY_DATES } from "@/lib/oso"

export default function Chart({
  data,
}: {
  data: { date: string; value: number; month: string }[]
}) {
  const formattedData = data
    .filter(
      (item) => new Date(item.date) >= new Date(OSO_QUERY_DATES.DEFAULT.start),
    )
    .map((item) => ({
      ...item,
      monthLabel: item.month,
    }))

  function appendPhantomPointIfNearMonthEnd(data: typeof formattedData) {
    if (!data.length) return data

    const last = data[data.length - 1]
    const lastDate = new Date(last.date)

    const year = lastDate.getFullYear()
    const month = lastDate.getMonth()
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate()

    const dayOfLastDate = lastDate.getDate()

    const daysToEndOfMonth = lastDayOfMonth - dayOfLastDate

    if (daysToEndOfMonth <= EOM_DAYS_OFFSET) {
      const phantomDate = new Date(year, month + 1, 1).toISOString()

      return [
        ...data,
        {
          ...last,
          date: phantomDate,
          monthLabel: "",
        },
      ]
    }

    return data
  }

  const extendedData = appendPhantomPointIfNearMonthEnd(formattedData)

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart
        className="w-full"
        width={478}
        height={140}
        data={extendedData}
        margin={{ right: 25 }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF99A1" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#FBFCFE" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          strokeWidth={0}
          fontSize={14}
          interval={0}
          dx={10}
          tickFormatter={(value: string) => {
            const date = new Date(value)
            return date.getDate() === 1
              ? date.toLocaleString("en-US", { month: "short" })
              : ""
          }}
        />
        <Tooltip />
        <Area
          type="bump"
          dataKey="value"
          stroke="#FF0420"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorUv)"
          className="scale-x-105"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
