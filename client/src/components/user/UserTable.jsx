import { useState } from "react";
import { FaEdit, FaTrash, FaSearch, FaUserShield, FaToggleOn, FaToggleOff } from "react-icons/fa";

const ROLE_CLASSES = {
  Admin: "bg-red-50 text-red-700 border border-red-200",
  "Fleet Manager": "bg-blue-50 text-blue-700 border border-blue-200",
  Driver: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Safety Officer": "bg-amber-50 text-amber-700 border border-amber-200",
  "Financial Analyst": "bg-purple-50 text-purple-700 border border-purple-200",
};

const STATUS_CLASSES = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  Inactive: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function UserTable({ users, loading, currentUserId, onEditRole, onToggleStatus, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 mb-3 text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-sm">Loading users...</p>
      </div>
    );
  }

  const filtered = (users || []).filter((u) => {
    const matchSearch =
      !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {/* Role Filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-600 transition-all cursor-pointer"
        >
          <option value="">All Roles</option>
          {["Admin", "Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"].map((r) => (
            <option key={r} value={r}>
              {r}
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
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <span className="text-xs text-slate-500 whitespace-nowrap sm:ml-2">
          {filtered.length} of {users?.length || 0} users
        </span>
      </div>

      {/* Table Container */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center text-slate-400">
          <FaUserShield className="text-5xl mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-500">No users found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Name", "Email", "Phone", "Current Role", "Status", "Created Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((u) => {
                  const isSelf = u._id === currentUserId;
                  const roleClass = ROLE_CLASSES[u.role] || "bg-slate-50 text-slate-600 border-slate-200";
                  const statusCfg = STATUS_CLASSES[u.status] || STATUS_CLASSES["Active"];

                  return (
                    <tr key={u._id} className="hover:bg-blue-50/40 transition-colors duration-150">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {u.fullName?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {u.fullName} {isSelf && <span className="text-xs text-blue-500 font-bold ml-1">(You)</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-sm text-slate-500">{u.phone || "—"}</td>

                      {/* Current Role */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${roleClass}`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {u.status}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditRole(u)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 cursor-pointer"
                            title="Edit Role"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          
                          <button
                            onClick={() => !isSelf && onToggleStatus(u)}
                            disabled={isSelf}
                            className={`p-2 rounded-xl transition-all duration-200 ${
                              isSelf
                                ? "text-slate-200 cursor-not-allowed"
                                : "text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                            }`}
                            title={isSelf ? "Cannot deactivate yourself" : "Change Status"}
                          >
                            {u.status === "Active" ? (
                              <FaToggleOn className="text-sm text-emerald-500" />
                            ) : (
                              <FaToggleOff className="text-sm" />
                            )}
                          </button>

                          <button
                            onClick={() => !isSelf && onDelete(u)}
                            disabled={isSelf}
                            className={`p-2 rounded-xl transition-all duration-200 ${
                              isSelf
                                ? "text-slate-200 cursor-not-allowed"
                                : "text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            }`}
                            title={isSelf ? "Cannot delete yourself" : "Delete User"}
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

export default UserTable;
