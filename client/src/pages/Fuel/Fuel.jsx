import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FaGasPump,
  FaPlus,
  FaMoneyBillWave,
  FaFire,
  FaTruck,
} from "react-icons/fa";

import { getFuelLogs, deleteFuelLog } from "../../services/fuelService";
import FuelTable from "../../components/fuel/FuelTable";
import FuelForm from "../../components/fuel/FuelForm";
import DeleteModal from "../../components/common/DeleteModal";

function Fuel() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  // Delete modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    logId: null,
    vehicleNumber: "",
    date: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchFuelLogs();
  }, []);

  const fetchFuelLogs = async () => {
    try {
      setLoading(true);
      const res = await getFuelLogs();
      setFuelLogs(res.data.fuelLogs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch fuel logs");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingLog(null);
    setShowForm(true);
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setShowForm(true);
  };

  const handleDeleteRequest = (log) => {
    setDeleteModal({
      isOpen: true,
      logId: log._id,
      vehicleNumber: log.vehicle?.vehicleNumber || "N/A",
      date: new Date(log.fuelDate).toLocaleDateString("en-IN"),
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteFuelLog(deleteModal.logId);
      toast.success("Fuel log deleted successfully");
      setDeleteModal({ isOpen: false, logId: null, vehicleNumber: "", date: "" });
      fetchFuelLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete fuel log");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLog(null);
  };

  // Derived stats calculated via useMemo for optimized performance
  const stats = useMemo(() => {
    const totalEntries = fuelLogs.length;
    const totalCost = fuelLogs.reduce((s, l) => s + (l.totalCost || 0), 0);
    const totalQty = fuelLogs.reduce((s, l) => s + (l.quantity || 0), 0);
    const uniqueVehicles = new Set(fuelLogs.map((l) => l.vehicle?._id).filter(Boolean)).size;

    return { totalEntries, totalCost, totalQty, uniqueVehicles };
  }, [fuelLogs]);

  const formatCurrency = (n) =>
    `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statCards = [
    {
      label: "Total Logs",
      value: stats.totalEntries,
      icon: <FaGasPump />,
      gradient: "from-slate-600 to-slate-800",
      shadow: "shadow-slate-500/25",
    },
    {
      label: "Total Spent",
      value: formatCurrency(stats.totalCost),
      icon: <FaMoneyBillWave />,
      gradient: "from-emerald-500 to-emerald-700",
      shadow: "shadow-emerald-500/25",
    },
    {
      label: "Total Fuel Quantity",
      value: `${stats.totalQty.toFixed(1)} L`,
      icon: <FaFire />,
      gradient: "from-amber-500 to-amber-700",
      shadow: "shadow-amber-500/25",
    },
    {
      label: "Vehicles Fuelled",
      value: stats.uniqueVehicles,
      icon: <FaTruck />,
      gradient: "from-blue-500 to-blue-700",
      shadow: "shadow-blue-500/25",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fuel Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage all fuel refill logs across your fleet
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          <FaPlus className="text-xs" />
          Add Fuel Log
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
      <FuelTable
        fuelLogs={fuelLogs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      {/* Add / Edit Form Modal */}
      {showForm && (
        <FuelForm
          fuelLog={editingLog}
          onClose={handleFormClose}
          refreshFuelLogs={fetchFuelLogs}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, logId: null, vehicleNumber: "", date: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Fuel Log"
        message={`Are you sure you want to delete the fuel log for vehicle ${deleteModal.vehicleNumber} on ${deleteModal.date}? This action cannot be undone.`}
        isLoading={deleteLoading}
      />
    </div>
  );
}

export default Fuel;
