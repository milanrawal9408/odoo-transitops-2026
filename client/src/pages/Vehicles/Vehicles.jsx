import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTruck, FaPlus, FaCheckCircle, FaRoute, FaTools, FaTimesCircle } from "react-icons/fa";

import { getVehicles, deleteVehicle } from "../../services/vehicleService";
import VehicleTable from "../../components/vehicle/VehicleTable";
import VehicleForm from "../../components/vehicle/VehicleForm";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";

// Stat card
function StatCard({ icon, label, value, color, bg }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl px-5 py-4 flex-1 min-w-[160px]"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
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

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await getVehicles();
      setVehicles(res.data.vehicles || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  // Open Add form
  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  // Open Edit form
  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  // Open Delete confirm
  const handleDeleteRequest = (vehicle) => {
    setDeletingVehicle(vehicle);
    setShowDeleteModal(true);
  };

  // Confirm & execute delete
  const handleDeleteConfirm = async () => {
    if (!deletingVehicle) return;
    setDeleteLoading(true);
    try {
      await deleteVehicle(deletingVehicle._id);
      toast.success(`Vehicle ${deletingVehicle.vehicleNumber} deleted successfully`);
      fetchVehicles();
      setShowDeleteModal(false);
      setDeletingVehicle(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete vehicle");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletingVehicle(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  // Derived stats
  const total = vehicles.length;
  const available = vehicles.filter((v) => v.status === "Available").length;
  const onTrip = vehicles.filter((v) => v.status === "On Trip").length;
  const maintenance = vehicles.filter((v) => v.status === "Maintenance").length;
  const outOfService = vehicles.filter((v) => v.status === "Out of Service").length;

  return (
    <div className="min-h-screen" style={{ background: "#0B1120", color: "#E2E8F0" }}>
      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.15)" }}
              >
                <FaTruck style={{ color: "#3B82F6", fontSize: "18px" }} />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: "#F1F5F9" }}>
                Fleet Management
              </h1>
            </div>
            <p className="ml-13 text-sm" style={{ color: "#64748B", marginLeft: "52px" }}>
              Manage and monitor all vehicles in your fleet
            </p>
          </div>

          <button
            onClick={handleAddVehicle}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 25px rgba(37,99,235,0.55)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.4)")}
          >
            <FaPlus className="text-xs" />
            Add Vehicle
          </button>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="flex flex-wrap gap-4 mb-8">
            <StatCard
              icon={<FaTruck />}
              label="Total Vehicles"
              value={total}
              color="#3B82F6"
              bg="rgba(59,130,246,0.12)"
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
              color="#3B82F6"
              bg="rgba(59,130,246,0.12)"
            />
            <StatCard
              icon={<FaTools />}
              label="Maintenance"
              value={maintenance}
              color="#EAB308"
              bg="rgba(234,179,8,0.12)"
            />
            <StatCard
              icon={<FaTimesCircle />}
              label="Out of Service"
              value={outOfService}
              color="#EF4444"
              bg="rgba(239,68,68,0.12)"
            />
          </div>
        )}

        {/* Table */}
        <VehicleTable
          vehicles={vehicles}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />

        {/* Add / Edit Form Modal */}
        {showForm && (
          <VehicleForm
            vehicle={editingVehicle}
            onClose={handleFormClose}
            refreshVehicles={fetchVehicles}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <DeleteConfirmModal
            title="Delete Vehicle"
            message={
              deletingVehicle
                ? `Are you sure you want to delete vehicle ${deletingVehicle.vehicleNumber} (${deletingVehicle.manufacturer} ${deletingVehicle.model})? This action cannot be undone.`
                : "Are you sure you want to delete this vehicle?"
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

export default Vehicles;