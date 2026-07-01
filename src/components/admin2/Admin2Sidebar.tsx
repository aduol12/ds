import Icon from "./Icon";
import { NavItem } from "./types";

type Admin2SidebarProps = {
  navItems: NavItem[];
};

function Admin2Sidebar({ navItems }: Admin2SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-[#c2c9bb] bg-[#f8f9fc] shadow-sm lg:flex">
      <div className="p-6">
        <h1 className="text-xl font-bold text-[#154212]">DroughtSmart</h1>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#42493e]">Climate-Smart Admin</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {navItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={[
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors duration-200",
              item.active
                ? "border-r-4 border-[#154212] bg-[#a1d49433] font-bold text-[#154212]"
                : "text-[#42493e] hover:bg-[#e1e2e5]",
            ].join(" ")}
          >
            <Icon name={item.icon} className="text-[20px]" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-[#c2c9bb] p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#bcf0ae] text-[#23501e]">
          <Icon name="account_circle" className="text-[20px]" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#191c1e]">Admin User</p>
          <p className="text-[10px] text-[#42493e]">DS-X100-Admin</p>
        </div>
      </div>
    </aside>
  );
}

export default Admin2Sidebar;
