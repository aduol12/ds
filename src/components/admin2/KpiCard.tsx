import Icon from "./Icon";
import { KpiCardData } from "./types";

type KpiCardProps = {
  data: KpiCardData;
};

const iconToneClass: Record<NonNullable<KpiCardData["iconTone"]>, string> = {
  primary: "text-[#154212]",
  secondary: "text-[#005cba]",
  error: "text-[#ba1a1a]",
  warning: "text-[#664c00]",
};

const trendToneClass = {
  positive: "bg-[#bcf0ae] text-[#23501e]",
  warning: "bg-[#ffdf9b] text-[#5b4300]",
};

function KpiCard({ data }: KpiCardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-[#c2c9bb] bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        data.accent === "primary" ? "border-l-4 border-l-[#154212]" : "",
        data.accent === "error" ? "border-l-4 border-l-[#ba1a1a]" : "",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between">
        <Icon name={data.icon} className={`text-[20px] ${iconToneClass[data.iconTone ?? "primary"]}`} />
        {data.trend && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${trendToneClass[data.trend.tone]}`}>
            {data.trend.label}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#42493e]">{data.title}</p>
      <p className="mt-1 text-2xl font-bold text-[#191c1e]">{data.value}</p>
    </div>
  );
}

export default KpiCard;
