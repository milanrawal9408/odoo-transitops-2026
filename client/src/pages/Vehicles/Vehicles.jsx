import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { FaTruck, FaPlus, FaCheckCircle, FaRoute, FaTools, FaBan } from "react-icons/fa";

import { getVehicles, deleteVehicle } from "../../services/vehicleService";
import VehicleTable from "../../components/vehicle/VehicleTable";
import VehicleForm from "../../components/vehicle/VehicleForm";
import DeleteModal from "../../components/common/DeleteModal";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Delete modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    vehicleId: null,
    vehicleNumber: "",
  });
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
    setDeleteModal({
      isOpen: true,
      vehicleId: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
    });
  };

  // Confirm & execute delete
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteVehicle(deleteModal.vehicleId);
      toast.success(`Vehicle ${deleteModal.vehicleNumber} deleted successfully`);
      setDeleteModal({ isOpen: false, vehicleId: null, vehicleNumber: "" });
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete vehicle");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  // Derived stats
  const stats = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter((v) => v.status === "Available").length;
    const onTrip = vehicles.filter((v) => v.status === "On Trip").length;
    const maintenance = vehicles.filter((v) => v.status === "Maintenance").length;
    const outOfService = vehicles.filter((v) => v.status === "Out of Service").length;
    return { total, available, onTrip, maintenance, outOfService };
  }, [vehicles]);

  const statCards = [
    {
      label: "Total Vehicles",
      value: stats.total,
      icon: <FaTruck />,
      gradient: "from-slate-600 to-slate-800",
      shadow: "shadow-slate-500/25",
    },
    {
      label: "Available",
      value: stats.available,
      icon: <FaCheckCircle />,
      gradient: "from-emerald-500 to-emerald-700",
      shadow: "shadow-emerald-500/25",
    },
    {
      label: "On Trip",
      value: stats.onTrip,
      icon: <FaRoute />,
      gradient: "from-blue-500 to-blue-700",
      shadow: "shadow-blue-500/25",
    },
    {
      label: "In Maintenance",
      value: stats.maintenance,
      icon: <FaTools />,
      gradient: "from-amber-500 to-amber-700",
      shadow: "shadow-amber-500/25",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fleet Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and monitor all vehicles in your fleet
          </p>
        </div>
        <button
          onClick={handleAddVehicle}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          <FaPlus className="text-xs" />
          Add Vehicle
        </button>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, vehicleId: null, vehicleNumber: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle ${deleteModal.vehicleNumber}? This action cannot be undone.`}
        isLoading={deleteLoading}
      />
    </div>
  );
}

export default Vehicles;