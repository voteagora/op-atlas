import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

export default function Chart({
  data,
}: {
  data: { date: string; value: number; month: string }[]
}) {
  const formattedData = data.map((item) => ({
    ...item,
    monthLabel: item.month,
  }))

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart
        className="w-full"
        width={478}
        height={140}
        data={formattedData}
        margin={{ left: 15, right: 15 }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF99A1" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#FBFCFE" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="monthLabel"
          strokeWidth={0}
          fontSize={14}
          interval={0} // Ensures all labels are shown at equal spacing
          tickFormatter={(value, index) => {
            // Only show the first instance of each month
            const currentMonth = formattedData[index]?.month
            const prevMonth = index > 0 ? formattedData[index - 1]?.month : null
            return currentMonth !== prevMonth ? currentMonth : ""
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
