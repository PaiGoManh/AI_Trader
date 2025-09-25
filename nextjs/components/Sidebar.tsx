interface SidebarProps {
  selectedTab: string;
  onSelectTab: (key: string) => void;
}

export default function Sidebar({ selectedTab, onSelectTab }: SidebarProps) {
  const navItems = [
    { label: 'Dashboard', key: 'dashboard' },
    { label: 'Agent', key: 'agent' },
    { label: 'Transaction', key: 'transactions' },
    { label: 'Crypto Coins', key: 'coins' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-64 h-screen bg-[#0b0d12] ml-2 mt-2 text-gray-300 shadow-lg border border-gray-700 flex flex-col">
      <div className="px-6 py-4 text-xl font-bold text-white border-b border-gray-700 select-none">
        AI Agent Platform
      </div>
      <ul className="flex-grow overflow-y-auto mt-4">
        {navItems.map(({ key, label }) => {
          const isActive = selectedTab === key;
          return (
            <li key={key}>
              <button
                onClick={() => onSelectTab(key)}
                className={`w-[90%] text-left flex items-center px-6 py-3 ml-4 transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold'
                    : 'hover:bg-blue-500 mt-1 mb-1 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{/* icon placeholder */}</span>
                <span className="truncate">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="px-6 py-4 border-t border-gray-700 text-sm text-gray-500 select-none">
        © 2025 AI Trading Platform
      </div>
    </nav>
  );
}
