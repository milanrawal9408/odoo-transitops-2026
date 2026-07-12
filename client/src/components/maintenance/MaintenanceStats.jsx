import { FaWrench, FaClock, FaSpinner, FaDollarSign } from "react-icons/fa";

function MaintenanceStats({ records }) {
  const total = records.length;
  const pending = records.filter((r) => r.status === "Pending").length;
  const inProgress = records.filter((r) => r.status === "In Progress").length;
  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  const stats = [
    {
      label: "Total Records",
      value: total,
      icon: <FaWrench />,
      gradient: "from-slate-600 to-slate-800",
      shadow: "shadow-slate-500/25",
    },
    {
      label: "Pending",
      value: pending,
      icon: <FaClock />,
      gradient: "from-amber-500 to-amber-700",
      shadow: "shadow-amber-500/25",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: <FaSpinner className={inProgress > 0 ? "animate-spin" : ""} />,
      gradient: "from-blue-500 to-blue-700",
      shadow: "shadow-blue-500/25",
    },
    {
      label: "Total Cost",
      value: `₹${totalCost.toLocaleString("en-IN")}`,
      icon: <FaDollarSign />,
      gradient: "from-emerald-500 to-emerald-700",
      shadow: "shadow-emerald-500/25",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.gradient} text-white rounded-2xl p-5 shadow-lg ${card.shadow} transition-transform duration-200 hover:-translate-y-0.5`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">{card.label}</p>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
            </div>
            <div className="text-2xl text-white/40">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MaintenanceStats;
