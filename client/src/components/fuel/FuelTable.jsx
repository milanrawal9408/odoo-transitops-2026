import { useState } from "react";
import { FaEdit, FaTrash, FaGasPump, FaSearch } from "react-icons/fa";

// Fuel type tag colors in light theme
const FUEL_CONFIG = {
  Petrol: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Diesel: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  CNG: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Electric: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (n) =>
  n != null
    ? `₹${parseFloat(n).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "—";

function FuelTable({ fuelLogs, loading, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterFuel, setFilterFuel] = useState("");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 mb-3 text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-sm">Loading fuel logs...</p>
      </div>
    );
  }

  const filtered = (fuelLogs || []).filter((log) => {
    const vehicle = log.vehicle?.vehicleNumber?.toLowerCase() || "";
    const driver = log.driver?.user?.fullName?.toLowerCase() || "";
    const station = log.fuelStation?.toLowerCase() || "";
    const matchSearch =
      !search ||
      vehicle.includes(search.toLowerCase()) ||
      driver.includes(search.toLowerCase()) ||
      station.includes(search.toLowerCase());
    const matchFuel = !filterFuel || log.fuelType === filterFuel;
    return matchSearch && matchFuel;
  });

  // Totals for visible filtered data
  const totalCost = filtered.reduce((s, l) => s + (l.totalCost || 0), 0);
  const totalQty = filtered.reduce((s, l) => s + (l.quantity || 0), 0);

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
            placeholder="Search by registration number, driver, pump..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterFuel}
          onChange={(e) => setFilterFuel(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-600 transition-all cursor-pointer"
        >
          <option value="">All Fuel Types</option>
          {["Petrol", "Diesel", "CNG", "Electric"].map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        {/* Totals Summary */}
        {filtered.length > 0 && (
          <div className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-4 bg-slate-50 border border-slate-200/60 px-4 py-2 rounded-xl">
            <span>
              Total: <span className="font-bold text-slate-800">{totalQty.toFixed(1)} L</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Cost: <span className="font-bold text-blue-600">{formatCurrency(totalCost)}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>{filtered.length} logs</span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center text-slate-400">
          <FaGasPump className="text-5xl mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-500">No fuel logs found</p>
          <p className="text-sm mt-1">
            {fuelLogs.length === 0
              ? 'Click "Add Fuel Log" to log your first refill record'
              : "Try adjusting your filters"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Date", "Vehicle", "Driver", "Fuel Type", "Quantity", "Rate", "Total Cost", "Odometer", "Station", "Actions"].map(
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
                {filtered.map((log) => {
                  const fuelCfg = FUEL_CONFIG[log.fuelType] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
                  return (
                    <tr key={log._id} className="hover:bg-blue-50/40 transition-colors duration-150">
                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatDate(log.fuelDate)}
                      </td>

                      {/* Vehicle */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <FaGasPump className="text-blue-500 text-sm" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {log.vehicle?.vehicleNumber || "—"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {log.vehicle?.manufacturer} {log.vehicle?.model}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Driver */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700 text-sm">
                          {log.driver?.user?.fullName || "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Lic: {log.driver?.licenseNumber || "—"}
                        </p>
                      </td>

                      {/* Fuel Type */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${fuelCfg.bg} ${fuelCfg.text} ${fuelCfg.border}`}>
                          {log.fuelType}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {log.quantity != null ? `${log.quantity} L` : "—"}
                      </td>

                      {/* Rate */}
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {log.pricePerLiter != null ? `₹${log.pricePerLiter}/L` : "—"}
                      </td>

                      {/* Total Cost */}
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        {formatCurrency(log.totalCost)}
                      </td>

                      {/* Odometer */}
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {log.odometerReading != null ? `${log.odometerReading.toLocaleString()} km` : "—"}
                      </td>

                      {/* Station */}
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-[150px] truncate" title={log.fuelStation}>
                        {log.fuelStation || "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEdit(log)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 cursor-pointer"
                            title="Edit Log"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => onDelete(log)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer"
                            title="Delete Log"
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

export default FuelTable;
