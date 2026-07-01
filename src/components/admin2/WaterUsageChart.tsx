type WaterUsageChartProps = {
  bars: number[];
};

function WaterUsageChart({ bars }: WaterUsageChartProps) {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <section className="col-span-12 rounded-xl border border-[#c2c9bb] bg-white p-4 shadow-sm lg:col-span-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#191c1e]">Water Usage Over Time</h3>
          <p className="text-xs text-[#42493e]">7-day usage trend analysis.</p>
        </div>
        <select className="rounded-lg bg-[#f2f3f6] px-3 py-1 text-xs text-[#191c1e] outline-none">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      <div className="flex h-64 w-full items-end gap-1">
        {bars.map((height, index) => (
          <div
            key={`bar-${index}`}
            className="w-full rounded-t bg-[#4b92fe66] transition-colors duration-300 hover:bg-[#4b92fe]"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <div className="mt-2 flex justify-between px-1 text-[10px] font-medium text-[#42493e]">
        {dayLabels.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </section>
  );
}

export default WaterUsageChart;
