import Icon from "./Icon";

function Admin2Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#c2c9bb] bg-[#f8f9fc] px-4 sm:px-6 backdrop-blur">
      <div className="relative hidden w-full max-w-md sm:block">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#72796e]"
        />
        <input
          type="text"
          placeholder="Search devices, farms, or reports..."
          className="w-full rounded-full border border-[#c2c9bb] bg-[#f2f3f6] py-2 pl-10 pr-4 text-sm text-[#191c1e] outline-none ring-[#005cba] transition focus:ring-2"
        />
      </div>

      <div className="flex items-center gap-2 sm:ml-6 sm:gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#42493e] transition hover:bg-[#e1e2e5] sm:hidden" aria-label="Search">
          <Icon name="search" />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#42493e] transition hover:bg-[#e1e2e5]" aria-label="Help">
          <Icon name="help" />
        </button>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#42493e] transition hover:bg-[#e1e2e5]" aria-label="Notifications">
          <Icon name="notifications" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ba1a1a]" />
        </button>
        <div className="mx-2 h-8 w-px bg-[#c2c9bb]" />
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4b92fe] text-white">
          <Icon name="account_circle" className="text-[18px]" />
        </div>
      </div>
    </header>
  );
}

export default Admin2Topbar;
