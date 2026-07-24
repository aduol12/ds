import Icon from "./Icon";
import { DeviceStatusData } from "./types";

type DeviceStatusCardProps = {
  statuses: DeviceStatusData[];
};

function DeviceStatusCard({ statuses }: DeviceStatusCardProps) {
  return (
    <section className="col-span-12 rounded-xl border border-[#c2c9bb] bg-white p-4 shadow-sm lg:col-span-4">
      <h3 className="mb-1 text-lg font-semibold text-[#191c1e]">Device Status</h3>
      <p className="mb-6 text-xs text-[#42493e]">Network connectivity distribution.</p>

      <div className="mt-4 space-y-6">
        {statuses.map((status) => (
          <div key={status.label}>
            <div className="mb-2 flex justify-between text-xs">
              <span className="font-bold text-[#191c1e]">{status.label}</span>
              <span className="text-[#191c1e]">{status.valueLabel}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#e7e8eb]">
              <div
                className={status.tone === "primary" ? "h-full bg-[#154212]" : "h-full bg-[#ba1a1a]"}
                style={{ width: `${status.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-lg bg-[#bcf0ae26] p-4">
        <Icon name="cloud_done" className="text-[32px] text-[#154212]" />
        <div>
          <p className="text-xs font-bold text-[#23501e]">System Health: Excellent</p>
          <p className="text-[10px] text-[#42493e]">All critical relays functional.</p>
        </div>
      </div>
    </section>
  );
}

export default DeviceStatusCard;
