import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaUserPlus,
  FaFileDownload,
  FaSearch,
  FaUsers,
  FaUserCheck,
  FaUserShield,
  FaUserTie,
  FaShieldAlt,
  FaCalculator,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaEye,
  FaKey,
  FaBan,
  FaRoute,
  FaTruck,
  FaTools,
  FaGasPump,
  FaCalendarAlt,
} from "react-icons/fa";
import { useForm } from "react-hook-form";
import {
  getUsers,
  createUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserById,
  getUserActivities,
} from "../../services/userService";
import DeleteModal from "../../components/common/DeleteModal";

// Permissions Matrix Definition (SAP/Dynamics Grade)
const PERMISSION_MATRIX = [
  { module: "Dashboard", Admin: true, "Fleet Manager": true, Driver: true, "Safety Officer": true, "Financial Analyst": true },
  { module: "Vehicles", Admin: true, "Fleet Manager": true, Driver: true, "Safety Officer": true, "Financial Analyst": false },
  { module: "Trips", Admin: true, "Fleet Manager": true, Driver: true, "Safety Officer": false, "Financial Analyst": false },
  { module: "Maintenance", Admin: true, "Fleet Manager": true, Driver: false, "Safety Officer": true, "Financial Analyst": false },
  { module: "Fuel", Admin: true, "Fleet Manager": true, Driver: false, "Safety Officer": false, "Financial Analyst": true },
  { module: "Reports", Admin: true, "Fleet Manager": false, Driver: false, "Safety Officer": false, "Financial Analyst": true },
  { module: "AI Assistant", Admin: true, "Fleet Manager": true, Driver: false, "Safety Officer": false, "Financial Analyst": false },
  { module: "Users", Admin: true, "Fleet Manager": false, Driver: false, "Safety Officer": false, "Financial Analyst": false },
];

function Users() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & pagination states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Selection states for modifiable details
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [detailRelations, setDetailRelations] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Modals & triggers
  const [formModal, setFormModal] = useState({ isOpen: false, mode: "add", user: null });
  const [roleConfirm, setRoleConfirm] = useState({ isOpen: false, user: null, targetRole: "" });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchUsersList();
    fetchActivitiesLog();
  }, [page, roleFilter, statusFilter, sortField, sortOrder]);

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 8,
        search: search.trim() || undefined,
        role: roleFilter !== "All" ? roleFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
      };

      const res = await getUsers(params);
      
      // Client-side sorting fallback or helper
      let fetchedUsers = res.data.users || [];
      fetchedUsers.sort((a, b) => {
        let fieldA = a[sortField] || "";
        let fieldB = b[sortField] || "";
        if (typeof fieldA === "string") fieldA = fieldA.toLowerCase();
        if (typeof fieldB === "string") fieldB = fieldB.toLowerCase();

        if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      setUsers(fetchedUsers);
      setTotalPages(res.data.pages || 1);
      setStats(res.data.stats);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivitiesLog = async () => {
    try {
      const res = await getUserActivities();
      setActivities(res.data.logs || []);
    } catch (err) {
      console.warn("Could not retrieve administrative activity logs:", err.message);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsersList();
  };

  const handleOpenAdd = () => {
    reset();
    setFormModal({ isOpen: true, mode: "add", user: null });
  };

  const handleOpenEdit = (user) => {
    reset();
    setValue("fullName", user.fullName);
    setValue("phone", user.phone || "");
    setValue("role", user.role);
    setValue("status", user.status);
    setFormModal({ isOpen: true, mode: "edit", user });
  };

  const onSubmitForm = async (data) => {
    try {
      if (formModal.mode === "add") {
        if (data.password !== data.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        await createUser(data);
        toast.success("User created successfully");
      } else {
        const payload = {
          fullName: data.fullName,
          phone: data.phone,
          status: data.status,
          role: data.role,
        };
        if (data.password) {
          if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
          }
          payload.password = data.password;
        }
        await updateUser(formModal.user._id, payload);
        toast.success("User updated successfully");
      }
      setFormModal({ isOpen: false, mode: "add", user: null });
      fetchUsersList();
      fetchActivitiesLog();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save user account");
    }
  };

  const handleRoleChangeRequest = (user, targetRole) => {
    if (user.role === targetRole) return;
    setRoleConfirm({ isOpen: true, user, targetRole });
  };

  const confirmRoleChange = async () => {
    try {
      await updateUserRole(roleConfirm.user._id, roleConfirm.targetRole);
      toast.success(`Changed ${roleConfirm.user.fullName}'s role to ${roleConfirm.targetRole}`);
      setRoleConfirm({ isOpen: false, user: null, targetRole: "" });
      fetchUsersList();
      fetchActivitiesLog();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change role");
    }
  };

  const handleStatusToggle = async (user) => {
    const targetStatus = user.status === "Active" ? "Inactive" : "Active";
    try {
      setStatusLoading(true);
      await updateUserStatus(user._id, targetStatus);
      toast.success(`Account status for ${user.fullName} updated to ${targetStatus}`);
      fetchUsersList();
      fetchActivitiesLog();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteRequest = (user) => {
    setDeleteModal({ isOpen: true, id: user._id, name: user.fullName });
  };

  const confirmDeleteUser = async () => {
    try {
      setDeleteLoading(true);
      await deleteUser(deleteModal.id);
      toast.success("User account deleted successfully");
      setDeleteModal({ isOpen: false, id: null, name: "" });
      fetchUsersList();
      fetchActivitiesLog();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenDrawer = async (userId) => {
    try {
      setDrawerOpen(true);
      setDetailLoading(true);
      const res = await getUserById(userId);
      setSelectedUserDetail(res.data.user);
      setDetailRelations(res.data.relations);
    } catch (err) {
      toast.error("Failed to load user relations dashboard");
      setDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExportUsers = () => {
    // Generate simple comma separated CSV text
    const headers = "Full Name,Email,Phone,Role,Status,Created Date\n";
    const rows = users
      .map(
        (u) =>
          `"${u.fullName}","${u.email}","${u.phone || ""}","${u.role}","${u.status}","${new Date(
            u.createdAt
          ).toLocaleDateString()}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TransitOps_Users_Export.csv`;
    link.click();
    toast.success("Users CSV sheet generated successfully!");
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">User & Access Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage users, permissions, and role matrices across the ERP</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportUsers}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer shadow-sm"
          >
            <FaFileDownload /> Export Users
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            <FaUserPlus /> Add User
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: "Total Users", val: stats.total, icon: <FaUsers />, grad: "from-slate-600 to-slate-800" },
            { label: "Active Users", val: stats.active, icon: <FaUserCheck />, grad: "from-emerald-500 to-emerald-700" },
            { label: "Admins", val: stats.Admin, icon: <FaUserShield />, grad: "from-red-500 to-red-700" },
            { label: "Managers", val: stats["Fleet Manager"], icon: <FaUserTie />, grad: "from-blue-500 to-blue-700" },
            { label: "Drivers", val: stats.Driver, icon: <FaUserTie />, grad: "from-indigo-500 to-indigo-700" },
            { label: "Safety", val: stats["Safety Officer"], icon: <FaShieldAlt />, grad: "from-amber-500 to-amber-700" },
            { label: "Analysts", val: stats["Financial Analyst"], icon: <FaCalculator />, grad: "from-purple-500 to-purple-700" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{c.label}</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-black text-slate-800">{c.val}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.grad} text-white flex items-center justify-center text-xs shadow-inner`}>
                  {c.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Role</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Fleet Manager">Fleet Manager</option>
              <option value="Driver">Driver</option>
              <option value="Safety Officer">Safety Officer</option>
              <option value="Financial Analyst">Financial Analyst</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Users Table & Permission Matrix / Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Table Block */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                  <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort("fullName")}>
                    Name {sortField === "fullName" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort("email")}>
                    Email {sortField === "email" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-400">
                      <FaSpinner className="animate-spin text-blue-500 inline-block text-xl" />
                      <p className="text-xs mt-2">Loading user accounts...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No matching user credentials found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-blue-50/20 transition-colors duration-150">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {u.fullName[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{u.fullName}</p>
                            <p className="text-[10px] text-slate-400">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{u.email}</td>
                      <td className="px-6 py-3.5 text-slate-600">{u.phone || "—"}</td>
                      <td className="px-6 py-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChangeRequest(u, e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-100 rounded bg-slate-50 font-semibold text-slate-700"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Fleet Manager">Fleet Manager</option>
                          <option value="Driver">Driver</option>
                          <option value="Safety Officer">Safety Officer</option>
                          <option value="Financial Analyst">Financial Analyst</option>
                        </select>
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          disabled={statusLoading}
                          onClick={() => handleStatusToggle(u)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            u.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                          }`}
                        >
                          {u.status}
                        </button>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenDrawer(u._id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Relations"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(u)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Permission Matrix & Activities Block */}
        <div className="space-y-6">
          {/* Permission Matrix */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
            <div>
              <h3 className="text-sm font-black text-slate-800">Role Permission Matrix</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Authorization layout mapping for ERP modules</p>
            </div>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-bold uppercase text-slate-500">
                    <th className="px-3 py-2">Module</th>
                    <th className="px-2 py-2 text-center">Adm</th>
                    <th className="px-2 py-2 text-center">Mgr</th>
                    <th className="px-2 py-2 text-center">Drv</th>
                    <th className="px-2 py-2 text-center">Sft</th>
                    <th className="px-2 py-2 text-center">Anl</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                  {PERMISSION_MATRIX.map((m) => (
                    <tr key={m.module} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-bold text-slate-700">{m.module}</td>
                      <td className="px-2 py-2 text-center">
                        {m.Admin ? <FaCheck className="text-emerald-500 mx-auto" /> : <FaTimes className="text-slate-300 mx-auto" />}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {m["Fleet Manager"] ? <FaCheck className="text-emerald-500 mx-auto" /> : <FaTimes className="text-slate-300 mx-auto" />}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {m.Driver ? <FaCheck className="text-emerald-500 mx-auto" /> : <FaTimes className="text-slate-300 mx-auto" />}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {m["Safety Officer"] ? <FaCheck className="text-emerald-500 mx-auto" /> : <FaTimes className="text-slate-300 mx-auto" />}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {m["Financial Analyst"] ? <FaCheck className="text-emerald-500 mx-auto" /> : <FaTimes className="text-slate-300 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Timeline logs */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800">Admin Audit Logs</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Real-time trace details of user actions</p>
            </div>
            <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No administrative audit records.</p>
              ) : (
                activities.map((act) => (
                  <div key={act._id} className="flex gap-3 relative pl-3 border-l border-slate-100 pb-3 last:pb-0">
                    <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white ring-4 ring-blue-50" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 leading-snug">{act.action}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{act.details}</p>
                      <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mt-1">
                        By {act.performedBy?.fullName || "System"} • {new Date(act.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10" onClick={(e) => e.stopPropagation()}>
            <div className="w-screen max-w-md bg-white shadow-xl flex flex-col justify-between border-l border-slate-100 animate-slide-in">
              <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-800">User Profile Summary</h2>
                  <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                    <FaTimes />
                  </button>
                </div>

                {/* Content */}
                {detailLoading || !selectedUserDetail ? (
                  <div className="flex flex-col items-center justify-center h-96 gap-2">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                    <p className="text-xs text-slate-400">Fetching user metrics...</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* User profile banner */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-2xl">
                        {selectedUserDetail.fullName[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base">{selectedUserDetail.fullName}</h3>
                        <p className="text-xs text-slate-500">{selectedUserDetail.email}</p>
                        <div className="flex gap-1.5 mt-2">
                          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                            {selectedUserDetail.role}
                          </span>
                          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-slate-50 text-slate-600 rounded-full border border-slate-200">
                            {selectedUserDetail.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata fields */}
                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Phone</span>
                        <span>{selectedUserDetail.phone || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Joined</span>
                        <span>{new Date(selectedUserDetail.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Driver relationships details (trips, vehicles) */}
                    {selectedUserDetail.role === "Driver" && detailRelations && (
                      <div className="space-y-5">
                        {/* Vehicle */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Assigned Vehicle</span>
                          {detailRelations.assignedVehicle ? (
                            <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3">
                              <FaTruck className="text-blue-500 text-sm" />
                              <div className="text-xs">
                                <p className="font-bold text-slate-700">{detailRelations.assignedVehicle.vehicleNumber}</p>
                                <p className="text-slate-400">{detailRelations.assignedVehicle.manufacturer} {detailRelations.assignedVehicle.model}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No vehicle currently assigned.</p>
                          )}
                        </div>

                        {/* Recent trips */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Recent Journeys</span>
                          {detailRelations.trips.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No trip entries logged.</p>
                          ) : (
                            <div className="space-y-2">
                              {detailRelations.trips.map((t) => (
                                <div key={t._id} className="p-3 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                                  <div>
                                    <p className="font-bold text-slate-700">{t.source} → {t.destination}</p>
                                    <p className="text-[10px] text-slate-400">{t.distance} km • {new Date(t.departureTime).toLocaleDateString()}</p>
                                  </div>
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold uppercase">
                                    {t.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {formModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setFormModal({ isOpen: false, mode: "add", user: null })}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FaUserPlus className="text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{formModal.mode === "add" ? "Register User" : "Update User"}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Manage credentials and authorization properties</p>
                </div>
              </div>
              <button
                onClick={() => setFormModal({ isOpen: false, mode: "add", user: null })}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <form id="userForm" onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter full name"
                    {...register("fullName", { required: "Full name is required" })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                  />
                  {errors.fullName && <span className="text-xs text-red-500 mt-1 block">{errors.fullName.message}</span>}
                </div>

                {formModal.mode === "add" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="user@transitops.com"
                      {...register("email", { required: "Email address is required" })}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                    />
                    {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      {...register("phone")}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="role">
                      System Role
                    </label>
                    <select
                      id="role"
                      {...register("role")}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                    >
                      <option value="Driver">Driver</option>
                      <option value="Admin">Admin</option>
                      <option value="Fleet Manager">Fleet Manager</option>
                      <option value="Safety Officer">Safety Officer</option>
                      <option value="Financial Analyst">Financial Analyst</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">
                      Password {formModal.mode === "edit" && <span className="text-xs text-slate-400 font-medium">(Only to reset)</span>}
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register("password", formModal.mode === "add" ? { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } } : {})}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                    />
                    {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                    />
                  </div>
                </div>

                {formModal.mode === "edit" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="status">
                      Account Status
                    </label>
                    <select
                      id="status"
                      {...register("status")}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setFormModal({ isOpen: false, mode: "add", user: null })}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="userForm"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all"
              >
                {formModal.mode === "add" ? "Register Account" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Alert */}
      {roleConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setRoleConfirm({ isOpen: false, user: null, targetRole: "" })}>
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm flex flex-col items-center text-center gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xl shadow-inner">
              <FaShieldAlt />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Change User Role?</h3>
              <p className="text-xs text-slate-500 mt-2">
                Are you sure you want to change **{roleConfirm.user.fullName}**'s role to **{roleConfirm.targetRole}**? This will instantly modify their system authorizations.
              </p>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => setRoleConfirm({ isOpen: false, user: null, targetRole: "" })}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                className="flex-1 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all cursor-pointer"
              >
                Confirm Demote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to permanently delete user "${deleteModal.name}"? This action cannot be undone.`}
        isLoading={deleteLoading}
      />
    </div>
  );
}

export default Users;
