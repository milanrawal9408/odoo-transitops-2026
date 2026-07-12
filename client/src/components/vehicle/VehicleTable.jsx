import { FaEdit, FaTrash, FaTruck, FaSearch } from "react-icons/fa";
import { useState } from "react";

// Status badge colors in light theme
const STATUS_CONFIG = {
  Available: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "On Trip": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Maintenance: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Out of Service": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

// Fuel type tag colors in light theme
const FUEL_CONFIG = {
  Petrol: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Diesel: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  CNG: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Electric: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 mb-3 text-blue-500" viewBox="0 0 24 24" fill="none">
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
    <div className="space-y-4">
      {/* Search + Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by registration number, make, model..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-600 transition-all cursor-pointer"
        >
          <option value="">All Types</option>
          {["Truck", "Van", "Bus", "Car", "Bike", "Other"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-600 transition-all cursor-pointer"
        >
          <option value="">All Statuses</option>
          {["Available", "On Trip", "Maintenance", "Out of Service"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <span className="text-xs text-slate-500 whitespace-nowrap sm:ml-2">
          {filtered.length} of {vehicles?.length || 0} vehicles
        </span>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center text-slate-400">
          <FaTruck className="text-5xl mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-500">No vehicles found</p>
          <p className="text-sm mt-1">
            {vehicles.length === 0
              ? 'Click "Add Vehicle" to register your first vehicle'
              : "Try adjusting your filters"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Vehicle No", "Type", "Manufacturer / Model", "Fuel", "Capacity", "Compliance", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((vehicle) => {
                  const statusCfg = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG["Available"];
                  const fuelCfg = FUEL_CONFIG[vehicle.fuelType] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
                  
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
                      className="hover:bg-blue-50/40 transition-colors duration-150"
                    >
                      {/* Vehicle Number */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <FaTruck className="text-blue-500 text-sm" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {vehicle.vehicleNumber}
                            </p>
                            <p className="text-xs text-slate-400">
                              Year: {vehicle.manufacturingYear}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                          {vehicle.vehicleType}
                        </span>
                      </td>

                      {/* Manufacturer / Model */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700 text-sm">
                          {vehicle.manufacturer}
                        </p>
                        <p className="text-xs text-slate-400">
                          {vehicle.model}
                        </p>
                      </td>

                      {/* Fuel */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border ${fuelCfg.bg} ${fuelCfg.text} ${fuelCfg.border}`}>
                          {vehicle.fuelType}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {vehicle.capacity}
                      </td>

                      {/* Compliance */}
                      <td className="px-6 py-4">
                        {hasAlert ? (
                          <div className="flex flex-col gap-1">
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
                                label="Registration"
                                date={vehicle.registrationExpiry}
                                expired={regExpired}
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600">✓ All valid</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {vehicle.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEdit(vehicle)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 cursor-pointer"
                            title="Edit Vehicle"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => onDelete(vehicle)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer"
                            title="Delete Vehicle"
                          >
                            <FaTrash className="text-sm" />
                          </button>
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
        expired 
          ? "bg-red-50 text-red-700 border-red-200" 
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      <span>{expired ? "✕" : "⚠"}</span>
      <span>
        {label}: {formatDate(date)}
      </span>
    </div>
  );
}

export default VehicleTable;