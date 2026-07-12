import { useState } from "react";
import { FaEdit, FaTrash, FaUserTie, FaSearch } from "react-icons/fa";

const STATUS_CONFIG = {
  Available:  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "On Trip":  { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Inactive:   { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
  Suspended:  { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date();
const isExpiringSoon = (dateStr) => {
  if (!dateStr) return false;
  const diff = new Date(dateStr) - new Date();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
};

function DriverTable({ drivers, loading, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 mb-3 text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-sm">Loading drivers...</p>
      </div>
    );
  }

  const filtered = (drivers || []).filter((d) => {
    const name = d.user?.fullName?.toLowerCase() || "";
    const email = d.user?.email?.toLowerCase() || "";
    const license = d.licenseNumber?.toLowerCase() || "";
    const matchSearch =
      !search ||
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      license.includes(search.toLowerCase());
    const matchStatus = !filterStatus || d.status === filterStatus;
    return matchSearch && matchStatus;
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
            placeholder="Search by driver name, email, or license..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-600 transition-all cursor-pointer"
        >
          <option value="">All Statuses</option>
          {["Available", "On Trip", "Inactive", "Suspended"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <span className="text-xs text-slate-500 whitespace-nowrap sm:ml-2">
          {filtered.length} of {drivers?.length || 0} drivers
        </span>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center text-slate-400">
          <FaUserTie className="text-5xl mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-500">No drivers found</p>
          <p className="text-sm mt-1">
            {drivers.length === 0
              ? 'Click "Add Driver" to register your first driver'
              : "Try adjusting your filters"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Driver", "License", "Experience", "License Expiry", "Contact", "Status", "Actions"].map(
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
                {filtered.map((driver) => {
                  const statusCfg = STATUS_CONFIG[driver.status] || STATUS_CONFIG["Available"];
                  const licExpired = isExpired(driver.licenseExpiry);
                  const licSoon = isExpiringSoon(driver.licenseExpiry);

                  return (
                    <tr
                      key={driver._id}
                      className="hover:bg-blue-50/40 transition-colors duration-150"
                    >
                      {/* Driver Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-sm">
                            {driver.user?.fullName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {driver.user?.fullName || "—"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {driver.user?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* License */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-slate-600">
                          {driver.licenseNumber}
                        </span>
                      </td>

                      {/* Experience */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {driver.experience ?? 0} yr{driver.experience !== 1 ? "s" : ""}
                      </td>

                      {/* License Expiry */}
                      <td className="px-6 py-4">
                        {licExpired ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded border bg-red-50 text-red-700 border-red-200">
                            ✕ Expired {formatDate(driver.licenseExpiry)}
                          </span>
                        ) : licSoon ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded border bg-amber-50 text-amber-700 border-amber-200">
                            ⚠ Expiring: {formatDate(driver.licenseExpiry)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
                            ✓ {formatDate(driver.licenseExpiry)}
                          </span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{driver.user?.phone || "—"}</p>
                        {driver.emergencyContactPhone && (
                          <p className="text-[10px] text-slate-400">
                            Emerg: {driver.emergencyContactPhone} ({driver.emergencyContactName})
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {driver.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEdit(driver)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 cursor-pointer"
                            title="Edit Driver"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => onDelete(driver)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer"
                            title="Delete Driver"
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

export default DriverTable;
