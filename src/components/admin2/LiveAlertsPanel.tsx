import Icon from "./Icon";
import { AlertData } from "./types";

type LiveAlertsPanelProps = {
  alerts: AlertData[];
};

function LiveAlertsPanel({ alerts }: LiveAlertsPanelProps) {
  return (
    <section className="col-span-12 flex max-h-[500px] flex-col rounded-xl border border-[#c2c9bb] bg-white shadow-sm lg:col-span-4">
      <div className="border-b border-[#c2c9bb] p-4">
        <h3 className="text-lg font-semibold text-[#191c1e]">Live Alerts</h3>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {alerts.map((alertItem) => {
          const isCritical = alertItem.level === "CRITICAL";
          return (
            <article
              key={`${alertItem.level}-${alertItem.title}`}
              className={[
                "flex gap-3 rounded-lg border p-4",
                isCritical ? "border-[#ba1a1a33] bg-[#ffdad64d]" : "border-[#f3bf3b66] bg-[#ffdf9b4d]",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  isCritical ? "bg-[#ba1a1a1a] text-[#ba1a1a]" : "bg-[#f3bf3b1a] text-[#664c00]",
                ].join(" ")}
              >
                <Icon name={alertItem.icon} />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${isCritical ? "text-[#ba1a1a]" : "text-[#664c00]"}`}>
                  {alertItem.level}
                </p>
                <p className="text-sm text-[#191c1e]">{alertItem.title}</p>
                <p className="mt-1 text-[11px] text-[#42493e]">{alertItem.meta}</p>
                <button
                  className={[
                    "mt-3 rounded-lg px-4 py-1.5 text-xs font-bold transition-colors",
                    isCritical
                      ? "bg-[#154212] text-white hover:bg-[#2d5a27]"
                      : "border border-[#154212] text-[#154212] hover:bg-[#bcf0ae]",
                  ].join(" ")}
                >
                  Resolve
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="bg-[#f2f3f6] p-4 text-center">
        <a href="#" className="text-xs font-bold text-[#154212] hover:underline">
          View All Notifications
        </a>
      </div>
    </section>
  );
}

export default LiveAlertsPanel;
