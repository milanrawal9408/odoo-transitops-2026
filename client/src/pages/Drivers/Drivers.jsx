import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FaUserTie,
  FaPlus,
  FaCheckCircle,
  FaRoute,
  FaBan,
} from "react-icons/fa";

import {
  getDrivers,
  deleteDriver,
} from "../../services/driverService";

import DriverTable from "../../components/driver/DriverTable";
import DriverForm from "../../components/driver/DriverForm";
import DeleteModal from "../../components/common/DeleteModal";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    driverId: null,
    driverName: "",
  });
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
    setDeleteModal({
      isOpen: true,
      driverId: driver._id,
      driverName: driver.user?.fullName || "this driver",
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteDriver(deleteModal.driverId);
      toast.success(
        `Driver ${deleteModal.driverName} deleted successfully`
      );
      setDeleteModal({ isOpen: false, driverId: null, driverName: "" });
      fetchDrivers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete driver");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDriver(null);
  };

  // Derived stats
  const stats = useMemo(() => {
    const total = drivers.length;
    const available = drivers.filter((d) => d.status === "Available").length;
    const onTrip = drivers.filter((d) => d.status === "On Trip").length;
    const suspended = drivers.filter((d) => d.status === "Suspended").length;
    return { total, available, onTrip, suspended };
  }, [drivers]);

  const statCards = [
    {
      label: "Total Drivers",
      value: stats.total,
      icon: <FaUserTie />,
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
      label: "Suspended",
      value: stats.suspended,
      icon: <FaBan />,
      gradient: "from-red-500 to-red-700",
      shadow: "shadow-red-500/25",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Driver Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and monitor all drivers in your fleet
          </p>
        </div>

        <button
          onClick={handleAddDriver}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          <FaPlus className="text-xs" />
          Add Driver
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
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, driverId: null, driverName: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Driver"
        message={`Are you sure you want to delete driver profile for ${deleteModal.driverName}? This action cannot be undone.`}
        isLoading={deleteLoading}
      />
    </div>
  );
}

export default Drivers;