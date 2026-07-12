import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaUserTie,
  FaPlus,
  FaCheckCircle,
  FaRoute,
  FaBan,
  FaUserSlash,
} from "react-icons/fa";

import {
  getDrivers,
  deleteDriver,
} from "../../services/driverService";

import DriverTable from "../../components/driver/DriverTable";
import DriverForm from "../../components/driver/DriverForm";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl px-5 py-4 flex-1 min-w-[150px]"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bg }}
      >
        <span style={{ color, fontSize: "18px" }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "#E2E8F0" }}>
          {value}
        </p>
        <p className="text-xs" style={{ color: "#64748B" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await getDrivers();
      setDrivers(res.data.drivers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = () => {
    setEditingDriver(null);
    setShowForm(true);
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setShowForm(true);
  };

  const handleDeleteRequest = (driver) => {
    setDeletingDriver(driver);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDriver) return;
    setDeleteLoading(true);
    try {
      await deleteDriver(deletingDriver._id);
      toast.success(
        `Driver ${deletingDriver.user?.fullName || ""} deleted successfully`
      );
      fetchDrivers();
      setShowDeleteModal(false);
      setDeletingDriver(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete driver");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletingDriver(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDriver(null);
  };

  // Derived stats
  const total = drivers.length;
  const available = drivers.filter((d) => d.status === "Available").length;
  const onTrip = drivers.filter((d) => d.status === "On Trip").length;
  const inactive = drivers.filter((d) => d.status === "Inactive").length;
  const suspended = drivers.filter((d) => d.status === "Suspended").length;

  return (
    <div className="min-h-screen" style={{ background: "#0B1120", color: "#E2E8F0" }}>
      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.15)" }}
              >
                <FaUserTie style={{ color: "#818CF8", fontSize: "18px" }} />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: "#F1F5F9" }}>
                Driver Management
              </h1>
            </div>
            <p className="text-sm" style={{ color: "#64748B", marginLeft: "52px" }}>
              Manage and monitor all drivers in your fleet
            </p>
          </div>

          <button
            onClick={handleAddDriver}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #6366F1, #4F46E5)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 25px rgba(99,102,241,0.55)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.4)")}
          >
            <FaPlus className="text-xs" />
            Add Driver
          </button>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="flex flex-wrap gap-4 mb-8">
            <StatCard
              icon={<FaUserTie />}
              label="Total Drivers"
              value={total}
              color="#818CF8"
              bg="rgba(99,102,241,0.12)"
            />
            <StatCard
              icon={<FaCheckCircle />}
              label="Available"
              value={available}
              color="#22C55E"
              bg="rgba(34,197,94,0.12)"
            />
            <StatCard
              icon={<FaRoute />}
              label="On Trip"
              value={onTrip}
              color="#818CF8"
              bg="rgba(99,102,241,0.12)"
            />
            <StatCard
              icon={<FaUserSlash />}
              label="Inactive"
              value={inactive}
              color="#94A3B8"
              bg="rgba(148,163,184,0.1)"
            />
            <StatCard
              icon={<FaBan />}
              label="Suspended"
              value={suspended}
              color="#EF4444"
              bg="rgba(239,68,68,0.12)"
            />
          </div>
        )}

        {/* Table */}
        <DriverTable
          drivers={drivers}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />

        {/* Add / Edit Form Modal */}
        {showForm && (
          <DriverForm
            driver={editingDriver}
            onClose={handleFormClose}
            refreshDrivers={fetchDrivers}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <DeleteConfirmModal
            title="Delete Driver"
            message={
              deletingDriver
                ? `Are you sure you want to delete the driver profile for ${
                    deletingDriver.user?.fullName || "this driver"
                  }? This action cannot be undone.`
                : "Are you sure you want to delete this driver?"
            }
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            loading={deleteLoading}
          />
        )}

      </div>
    </div>
  );
}

export default Drivers;