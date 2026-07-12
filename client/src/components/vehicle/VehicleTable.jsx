import { FaEdit, FaTrash, FaTruck, FaSearch } from "react-icons/fa";
import { useState } from "react";

// Status badge colors
const STATUS_CONFIG = {
  Available: { bg: "rgba(34,197,94,0.12)", color: "#22C55E", dot: "#22C55E" },
  "On Trip": { bg: "rgba(59,130,246,0.12)", color: "#3B82F6", dot: "#3B82F6" },
  Maintenance: { bg: "rgba(234,179,8,0.12)", color: "#EAB308", dot: "#EAB308" },
  "Out of Service": { bg: "rgba(239,68,68,0.12)", color: "#EF4444", dot: "#EF4444" },
};

// Fuel type icon mapping
const FUEL_COLORS = {
  Petrol: "#F59E0B",
  Diesel: "#6366F1",
  CNG: "#10B981",
  Electric: "#06B6D4",
};

// Format date to readable form
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// Check if a date is expiring within 30 days
const isExpiringSoon = (dateStr) => {
  if (!dateStr) return false;
  const diff = new Date(dateStr) - new Date();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
};

const isExpired = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

function VehicleTable({ vehicles, loading, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: "#475569" }}>
        <svg className="animate-spin w-8 h-8 mb-3" style={{ color: "#3B82F6" }} viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-sm">Loading vehicles...</p>
      </div>
    );
  }

  const filtered = (vehicles || []).filter((v) => {
    const matchSearch =
      !search ||
      v.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
      v.manufacturer?.toLowerCase().includes(search.toLowerCase()) ||
      v.model?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || v.vehicleType === filterType;
    const matchStatus = !filterStatus || v.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div>
      {/* Search + Filter Bar */}
      <div
        className="flex flex-wrap items-center gap-3 mb-5 p-4 rounded-xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#475569", fontSize: "13px" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicles..."
            className="w-full py-2 pl-9 pr-4 rounded-lg text-sm outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#E2E8F0",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="py-2 px-3 rounded-lg text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: filterType ? "#E2E8F0" : "#475569",
          }}
        >
          <option value="">All Types</option>
          {["Truck", "Van", "Bus", "Car", "Bike", "Other"].map((t) => (
            <option key={t} value={t} style={{ background: "#1E293B", color: "#E2E8F0" }}>
              {t}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="py-2 px-3 rounded-lg text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: filterStatus ? "#E2E8F0" : "#475569",
          }}
        >
          <option value="">All Statuses</option>
          {["Available", "On Trip", "Maintenance", "Out of Service"].map((s) => (
            <option key={s} value={s} style={{ background: "#1E293B", color: "#E2E8F0" }}>
              {s}
            </option>
          ))}
        </select>

        <span className="text-xs ml-auto" style={{ color: "#475569" }}>
          {filtered.length} of {vehicles?.length || 0} vehicles
        </span>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(59,130,246,0.1)" }}
          >
            <FaTruck className="text-3xl" style={{ color: "#3B82F6", opacity: 0.5 }} />
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: "#CBD5E1" }}>
            {search || filterType || filterStatus ? "No matching vehicles found" : "No vehicles added yet"}
          </p>
          <p className="text-xs" style={{ color: "#475569" }}>
            {search || filterType || filterStatus
              ? "Try adjusting your filters"
              : "Click '+ Add Vehicle' to register your first vehicle"}
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Vehicle No", "Type", "Manufacturer / Model", "Fuel", "Capacity", "Compliance", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#64748B" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((vehicle, idx) => {
                  const statusCfg = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG["Available"];
                  const fuelColor = FUEL_COLORS[vehicle.fuelType] || "#94A3B8";
                  const insExpired = isExpired(vehicle.insuranceExpiry);
                  const insSoon = isExpiringSoon(vehicle.insuranceExpiry);
                  const pucExpired = isExpired(vehicle.pollutionExpiry);
                  const pucSoon = isExpiringSoon(vehicle.pollutionExpiry);
                  const regExpired = isExpired(vehicle.registrationExpiry);
                  const regSoon = isExpiringSoon(vehicle.registrationExpiry);
                  const hasAlert = insExpired || insSoon || pucExpired || pucSoon || regExpired || regSoon;

                  return (
                    <tr
                      key={vehicle._id}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Vehicle Number */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(59,130,246,0.12)" }}
                          >
                            <FaTruck style={{ color: "#3B82F6", fontSize: "12px" }} />
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: "#E2E8F0" }}>
                              {vehicle.vehicleNumber}
                            </p>
                            <p className="text-xs" style={{ color: "#475569" }}>
                              {vehicle.manufacturingYear}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ background: "rgba(148,163,184,0.1)", color: "#94A3B8" }}
                        >
                          {vehicle.vehicleType}
                        </span>
                      </td>

                      {/* Manufacturer / Model */}
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: "#CBD5E1" }}>
                          {vehicle.manufacturer}
                        </p>
                        <p className="text-xs" style={{ color: "#475569" }}>
                          {vehicle.model}
                        </p>
                      </td>

                      {/* Fuel */}
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: fuelColor }}
                        >
                          ⬤ {vehicle.fuelType}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td className="px-4 py-3">
                        <span style={{ color: "#94A3B8" }}>{vehicle.capacity}</span>
                      </td>

                      {/* Compliance */}
                      <td className="px-4 py-3">
                        {hasAlert ? (
                          <div className="space-y-1">
                            {(insExpired || insSoon) && (
                              <CompliancePill
                                label="Insurance"
                                date={vehicle.insuranceExpiry}
                                expired={insExpired}
                              />
                            )}
                            {(pucExpired || pucSoon) && (
                              <CompliancePill
                                label="PUC"
                                date={vehicle.pollutionExpiry}
                                expired={pucExpired}
                              />
                            )}
                            {(regExpired || regSoon) && (
                              <CompliancePill
                                label="Reg"
                                date={vehicle.registrationExpiry}
                                expired={regExpired}
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: "#22C55E" }}>✓ All valid</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: statusCfg.bg, color: statusCfg.color }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: statusCfg.dot }}
                          />
                          {vehicle.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ActionButton
                            onClick={() => onEdit(vehicle)}
                            color="#3B82F6"
                            hoverBg="rgba(59,130,246,0.15)"
                            title="Edit vehicle"
                          >
                            <FaEdit />
                          </ActionButton>
                          <ActionButton
                            onClick={() => onDelete(vehicle)}
                            color="#EF4444"
                            hoverBg="rgba(239,68,68,0.15)"
                            title="Delete vehicle"
                          >
                            <FaTrash />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CompliancePill({ label, date, expired }) {
  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
      style={{
        background: expired ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)",
        color: expired ? "#EF4444" : "#EAB308",
      }}
    >
      <span>{expired ? "✕" : "⚠"}</span>
      <span>
        {label}: {formatDate(date)}
      </span>
    </div>
  );
}

function ActionButton({ onClick, color, hoverBg, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm"
      style={{ background: "rgba(255,255,255,0.05)", color: "#64748B" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.color = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        e.currentTarget.style.color = "#64748B";
      }}
    >
      {children}
    </button>
  );
}

export default VehicleTable;