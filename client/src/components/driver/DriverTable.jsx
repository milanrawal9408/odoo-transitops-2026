import { useState } from "react";
import { FaEdit, FaTrash, FaUserTie, FaSearch } from "react-icons/fa";

const STATUS_CONFIG = {
  Available:  { bg: "rgba(34,197,94,0.12)",  color: "#22C55E", dot: "#22C55E"  },
  "On Trip":  { bg: "rgba(99,102,241,0.12)", color: "#818CF8", dot: "#818CF8"  },
  Inactive:   { bg: "rgba(148,163,184,0.1)", color: "#94A3B8", dot: "#94A3B8"  },
  Suspended:  { bg: "rgba(239,68,68,0.12)",  color: "#EF4444", dot: "#EF4444"  },
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
      <div className="flex flex-col items-center justify-center py-20" style={{ color: "#475569" }}>
        <svg className="animate-spin w-8 h-8 mb-3" style={{ color: "#6366F1" }} viewBox="0 0 24 24" fill="none">
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
    <div>
      {/* Search + Filter Bar */}
      <div
        className="flex flex-wrap items-center gap-3 mb-5 p-4 rounded-xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#475569", fontSize: "13px" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or license..."
            className="w-full py-2 pl-9 pr-4 rounded-lg text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#E2E8F0",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

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
          {["Available", "On Trip", "Inactive", "Suspended"].map((s) => (
            <option key={s} value={s} style={{ background: "#1E293B", color: "#E2E8F0" }}>
              {s}
            </option>
          ))}
        </select>

        <span className="text-xs ml-auto" style={{ color: "#475569" }}>
          {filtered.length} of {drivers?.length || 0} drivers
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
            style={{ background: "rgba(99,102,241,0.1)" }}
          >
            <FaUserTie className="text-3xl" style={{ color: "#6366F1", opacity: 0.5 }} />
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: "#CBD5E1" }}>
            {search || filterStatus ? "No matching drivers found" : "No drivers registered yet"}
          </p>
          <p className="text-xs" style={{ color: "#475569" }}>
            {search || filterStatus
              ? "Try adjusting your filters"
              : "Click '+ Add Driver' to register your first driver"}
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
                <tr
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {["Driver", "License", "Experience", "License Expiry", "Contact", "Status", "Actions"].map(
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
                {filtered.map((driver, idx) => {
                  const statusCfg = STATUS_CONFIG[driver.status] || STATUS_CONFIG["Available"];
                  const licExpired = isExpired(driver.licenseExpiry);
                  const licSoon = isExpiringSoon(driver.licenseExpiry);

                  return (
                    <tr
                      key={driver._id}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Driver Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold text-sm"
                            style={{
                              background: "rgba(99,102,241,0.15)",
                              color: "#818CF8",
                            }}
                          >
                            {driver.user?.fullName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: "#E2E8F0" }}>
                              {driver.user?.fullName || "—"}
                            </p>
                            <p className="text-xs" style={{ color: "#475569" }}>
                              {driver.user?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* License */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold" style={{ color: "#94A3B8" }}>
                          {driver.licenseNumber}
                        </span>
                      </td>

                      {/* Experience */}
                      <td className="px-4 py-3">
                        <span style={{ color: "#94A3B8" }}>
                          {driver.experience ?? 0} yr{driver.experience !== 1 ? "s" : ""}
                        </span>
                      </td>

                      {/* License Expiry */}
                      <td className="px-4 py-3">
                        {licExpired ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
                          >
                            ✕ Expired {formatDate(driver.licenseExpiry)}
                          </span>
                        ) : licSoon ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                            style={{ background: "rgba(234,179,8,0.1)", color: "#EAB308" }}
                          >
                            ⚠ {formatDate(driver.licenseExpiry)}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: "#22C55E" }}>
                            ✓ {formatDate(driver.licenseExpiry)}
                          </span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <p className="text-xs" style={{ color: "#94A3B8" }}>
                          {driver.user?.phone || "—"}
                        </p>
                        {driver.emergencyContactPhone && (
                          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                            Emergency: {driver.emergencyContactPhone}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: statusCfg.bg, color: statusCfg.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
                          {driver.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ActionButton
                            onClick={() => onEdit(driver)}
                            color="#818CF8"
                            hoverBg="rgba(99,102,241,0.15)"
                            title="Edit driver"
                          >
                            <FaEdit />
                          </ActionButton>
                          <ActionButton
                            onClick={() => onDelete(driver)}
                            color="#EF4444"
                            hoverBg="rgba(239,68,68,0.15)"
                            title="Delete driver"
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

export default DriverTable;
