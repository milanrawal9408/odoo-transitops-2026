import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaUserShield,
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaUserTie,
} from "react-icons/fa";

import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import UserTable from "../../components/user/UserTable";
import EditRoleModal from "../../components/user/EditRoleModal";
import DeleteModal from "../../components/common/DeleteModal";

function UserRoles() {
  const navigate = useNavigate();
  const { user: currentUser } = useUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [editingUser, setEditingUser] = useState(null);
  const [savingRole, setSavingRole] = useState(false);

  // Delete modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Force redirect non-admins back to dashboard
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== "Admin") {
      toast.error("Access denied — Admin only");
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data.users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  /* ── Edit Role ── */
  const handleEditRole = (user) => {
    setEditingUser(user);
  };

  const handleSaveRole = async (userId, role) => {
    setSavingRole(true);
    try {
      await updateUserRole(userId, role);
      toast.success("Role updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    } finally {
      setSavingRole(false);
    }
  };

  /* ── Toggle Status ── */
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    try {
      await updateUserStatus(user._id, newStatus);
      toast.success("Status updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  /* ── Delete User ── */
  const handleDeleteRequest = (user) => {
    setDeleteModal({
      isOpen: true,
      userId: user._id,
      userName: user.fullName,
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteUser(deleteModal.userId);
      toast.success("User deleted successfully");
      setDeleteModal({ isOpen: false, userId: null, userName: "" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Derived stats calculated via useMemo for optimized performance
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const inactive = users.filter((u) => u.status === "Inactive").length;
    const admins = users.filter((u) => u.role === "Admin").length;
    const drivers = users.filter((u) => u.role === "Driver").length;

    return { total, active, inactive, admins, drivers };
  }, [users]);

  const statCards = [
    {
      label: "Total Users",
      value: stats.total,
      icon: <FaUsers />,
      gradient: "from-slate-600 to-slate-800",
      shadow: "shadow-slate-500/25",
    },
    {
      label: "Active Users",
      value: stats.active,
      icon: <FaUserCheck />,
      gradient: "from-emerald-500 to-emerald-700",
      shadow: "shadow-emerald-500/25",
    },
    {
      label: "Inactive Users",
      value: stats.inactive,
      icon: <FaUserSlash />,
      gradient: "from-slate-400 to-slate-600",
      shadow: "shadow-slate-400/25",
    },
    {
      label: "Admins",
      value: stats.admins,
      icon: <FaUserShield />,
      gradient: "from-red-500 to-red-700",
      shadow: "shadow-red-500/25",
    },
    {
      label: "Drivers",
      value: stats.drivers,
      icon: <FaUserTie />,
      gradient: "from-blue-500 to-blue-700",
      shadow: "shadow-blue-500/25",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Role Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage user roles, status, and permissions across your ERP
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl w-fit">
          <FaUserShield className="text-xs" />
          Admin Only
        </span>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
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
      )}

      {/* Table */}
      <UserTable
        users={users}
        loading={loading}
        currentUserId={currentUser?._id || currentUser?.id}
        onEditRole={handleEditRole}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteRequest}
      />

      {/* Edit Role Modal */}
      {editingUser && (
        <EditRoleModal
          user={editingUser}
          onSave={handleSaveRole}
          onClose={() => setEditingUser(null)}
          saving={savingRole}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to permanently delete user ${deleteModal.userName}? This action cannot be undone.`}
        isLoading={deleteLoading}
      />
    </div>
  );
}

export default UserRoles;
