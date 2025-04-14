import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

export default function Chart({
  data,
}: {
  data: { date: string; value: number; month: string }[]
}) {
  const formattedData = data
    .filter((item) => new Date(item.date) >= new Date("2025-01-01"))
    .map((item) => ({
      ...item,
      monthLabel: item.month,
    }))

  function getNextMonthPhantomEntry(obj?: {
    date: string
    value: number
    month: string
    monthLabel: string
  }) {
    if (!obj) return null

    const currentDate = new Date(obj.date)
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    )

    const nextMonthShort = nextMonth.toLocaleString("en-US", { month: "short" })

    return {
      ...obj,
      date: nextMonth.toISOString().split("T")[0],
      month: nextMonthShort,
      monthLabel: nextMonthShort,
    }
  }

  const lastDate = formattedData.at(-1)
  const phantomEntry = getNextMonthPhantomEntry(lastDate)

  if (phantomEntry) {
    formattedData.push(phantomEntry)
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart
        className="w-full"
        width={478}
        height={140}
        data={formattedData}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF99A1" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#FBFCFE" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis
          dx={15}
          dataKey="date"
          strokeWidth={0}
          fontSize={14}
          interval={0}
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
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
