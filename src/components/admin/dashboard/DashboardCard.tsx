import { ReactNode } from "react";

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  color: string;
}

export default function DashboardCard({ icon, title, value, color }: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-gray-500">{title}</h2>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}
