import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

function Sidebar({ collapsed, mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' },
    { name: 'Live Data', href: '/live-data', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Devices', href: '/devices', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
    { name: 'Action Plans', href: '/action-plans', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop - only shows on mobile when menu is open */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 
        transition-all duration-300 ease-in-out z-50
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen 
          ? 'translate-x-0' 
          : '-translate-x-full lg:translate-x-0'
        }
      `}>
        <div className="flex flex-col h-full">
          {/* Header space */}
          <div className="h-20 flex-shrink-0"></div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => onClose()}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg 
                  transition-colors relative
                  ${isActive(item.href)
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                title={collapsed ? item.name : undefined}
              >
                {/* Active indicator */}
                {isActive(item.href) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r"></div>
                )}
                
                <svg
                  className={`flex-shrink-0 h-5 w-5 ${
                    isActive(item.href) ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                
                {!collapsed && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-3 border-t border-gray-200 flex-shrink-0">
            {!collapsed && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-700">System Status</span>
                </div>
                <p className="text-xs text-gray-600">All devices online</p>
                <p className="text-xs text-gray-500">Last sync: 2 min ago</p>
              </div>
            )}

            {/* Status indicator for collapsed sidebar */}
            {collapsed && (
              <div className="flex justify-center mb-3">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" title="All systems operational"></div>
              </div>
            )}

            {/* User info */}
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="h-8 w-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm">
                JF
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">John Farmer</p>
                  <p className="text-xs text-gray-500 truncate">Premium Plan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;