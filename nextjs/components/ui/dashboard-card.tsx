import React from "react";

interface DashboardBoxProps {
  title: string;
  stat: string | number;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const DashboardBox: React.FC<DashboardBoxProps> = ({ title, stat, icon, children }) => (
  <div className="bg-[#181c24] p-5 rounded-lg shadow-md flex flex-col min-h-[120px] justify-between">
    <div className="flex items-center space-x-3 text-gray-100">
      {icon && <span className="text-2xl">{icon}</span>}
      <span className="font-semibold">{title}</span>
    </div>
    <div className="mt-3 text-2xl font-bold text-white">{stat}</div>
    {children}
  </div>
);

export default DashboardBox;
