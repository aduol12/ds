import Icon from "./Icon";

type LegendItemProps = {
  label: string;
  colorClass: string;
};

function LegendItem({ label, colorClass }: LegendItemProps) {
  return (
    <span className="flex items-center gap-1 text-[10px] font-medium text-[#191c1e]">
      <span className={`h-2 w-2 rounded-full ${colorClass}`} />
      {label}
    </span>
  );
}

function RegionalMonitoringCard() {
  return (
    <section className="col-span-12 flex h-[500px] flex-col overflow-hidden rounded-xl border border-[#c2c9bb] bg-white shadow-sm lg:col-span-8">
      <div className="flex items-center justify-between border-b border-[#c2c9bb] bg-[#ffffffb3] p-4 backdrop-blur-md">
        <div>
          <h3 className="text-lg font-semibold text-[#191c1e]">Regional Farm Monitoring</h3>
          <p className="text-xs text-[#42493e]">Live status of sensor clusters across registered sectors.</p>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <LegendItem label="Optimal" colorClass="bg-[#154212]" />
          <LegendItem label="Warning" colorClass="bg-[#f3bf3b]" />
          <LegendItem label="Critical" colorClass="bg-[#ba1a1a]" />
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden bg-[#e7e8eb]">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')",
          }}
          aria-label="Regional map"
        />
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <button className="rounded-lg bg-white p-2 shadow transition hover:bg-[#f2f3f6]" aria-label="Zoom in">
            <Icon name="add" />
          </button>
          <button className="rounded-lg bg-white p-2 shadow transition hover:bg-[#f2f3f6]" aria-label="Zoom out">
            <Icon name="remove" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default RegionalMonitoringCard;
