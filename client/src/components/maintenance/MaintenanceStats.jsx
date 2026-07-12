import { FaWrench, FaClock, FaSpinner, FaDollarSign } from "react-icons/fa";

function MaintenanceStats({ records }) {
  const total = records.length;
  const pending = records.filter((r) => r.status === "Pending").length;
  const inProgress = records.filter((r) => r.status === "In Progress").length;
  const completed = records.filter((r) => r.status === "Completed").length;
  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  const stats = [
    {
      label: "Total Records",
      value: total,
      icon: <FaWrench />,
      accent: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      bg: "rgba(99, 102, 241, 0.08)",
      color: "#6366f1",
    },
    {
      label: "Pending",
      value: pending,
      icon: <FaClock />,
      accent: "linear-gradient(135deg, #f59e0b, #f97316)",
      bg: "rgba(245, 158, 11, 0.08)",
      color: "#f59e0b",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: <FaSpinner />,
      accent: "linear-gradient(135deg, #3b82f6, #06b6d4)",
      bg: "rgba(59, 130, 246, 0.08)",
      color: "#3b82f6",
    },
    {
      label: "Total Cost",
      value: `₹${totalCost.toLocaleString("en-IN")}`,
      icon: <FaDollarSign />,
      accent: "linear-gradient(135deg, #10b981, #14b8a6)",
      bg: "rgba(16, 185, 129, 0.08)",
      color: "#10b981",
    },
  ];

  return (
    <div className="maint-stats-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="maint-stat-card">
          <div
            className="maint-stat-accent"
            style={{ background: stat.accent }}
          />
          <div className="maint-stat-body">
            <div
              className="maint-stat-icon"
              style={{ background: stat.bg, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="maint-stat-info">
              <span className="maint-stat-label">{stat.label}</span>
              <span className="maint-stat-value" style={{ color: stat.color }}>
                {stat.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MaintenanceStats;
