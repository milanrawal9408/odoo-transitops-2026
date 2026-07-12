import { useState, useEffect, useCallback, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import MaintenanceStats from "../../components/maintenance/MaintenanceStats";
import MaintenanceFilters from "../../components/maintenance/MaintenanceFilters";
import MaintenanceTable from "../../components/maintenance/MaintenanceTable";
import MaintenanceFormModal from "../../components/maintenance/MaintenanceFormModal";
import MaintenanceViewModal from "../../components/maintenance/MaintenanceViewModal";
import DeleteModal from "../../components/common/DeleteModal";

import {
  getAllMaintenances,
  createMaintenance,
  updateMaintenance,
  completeMaintenance,
  deleteMaintenance,
} from "../../services/maintenanceService";
import { getVehicles } from "../../services/vehicleService";

function Maintenance() {
  const navigate = useNavigate();

  // ── Data State ──
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Filter State ──
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // ── Modal State ──
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ── Delete Modal State ──
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    recordId: null,
    vehicleNumber: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Handle 401 (not logged in) ──
  const handleAuthError = useCallback(
    (error) => {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return true;
      }
      return false;
    },
    [navigate]
  );

  // ── Fetch Data ──
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      let maintenanceData = [];
      let vehicleData = [];

      try {
        const maintRes = await getAllMaintenances();
        // Backend returns plural "maintenances" in our updated controller
        maintenanceData = maintRes.data.maintenances || maintRes.data.maintenance || [];
      } catch (error) {
        if (handleAuthError(error)) return;
        toast.error(
          error.response?.data?.message || "Failed to fetch maintenance records"
        );
      }

      try {
        const vehicleRes = await getVehicles();
        vehicleData = vehicleRes.data.vehicles || [];
      } catch (error) {
        if (handleAuthError(error)) return;
        console.warn("Could not load vehicles for dropdown:", error.message);
      }

      setRecords(maintenanceData);
      setVehicles(vehicleData);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Filtered Records ──
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Status filter
      if (statusFilter && record.status !== statusFilter) return false;

      // Type filter
      if (typeFilter && record.maintenanceType !== typeFilter) return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchVehicle = record.vehicle?.vehicleNumber
          ?.toLowerCase()
          .includes(search);
        const matchTechnician = record.technician
          ?.toLowerCase()
          .includes(search);
        const matchType = record.maintenanceType
          ?.toLowerCase()
          .includes(search);
        const matchDesc = record.description?.toLowerCase().includes(search);

        if (!matchVehicle && !matchTechnician && !matchType && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [records, searchTerm, statusFilter, typeFilter]);

  // ── Handlers ──
  const handleOpenCreate = () => {
  console.log("OPEN BUTTON CLICKED");
  setEditingRecord(null);
  setIsFormModalOpen(true);
};

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (record) => {
    setDeleteModal({
      isOpen: true,
      recordId: record._id,
      vehicleNumber: record.vehicle?.vehicleNumber || "this vehicle",
    });
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsViewModalOpen(false);
    setEditingRecord(null);
    setSelectedRecord(null);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingRecord) {
        await updateMaintenance(editingRecord._id, data);
        toast.success("Maintenance record updated successfully");
      } else {
        await createMaintenance(data);
        toast.success("Maintenance record created successfully");
      }
      handleCloseModals();
      fetchData();
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error.response?.data?.message || "Failed to save maintenance record"
      );
    }
  };

  const handleComplete = async (record) => {
    try {
      await completeMaintenance(record._id);
      toast.success("Maintenance marked as completed");
      fetchData();
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error.response?.data?.message || "Failed to complete maintenance"
      );
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteMaintenance(deleteModal.recordId);
      toast.success("Maintenance record deleted successfully");
      setDeleteModal({ isOpen: false, recordId: null, vehicleNumber: "" });
      fetchData();
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error.response?.data?.message || "Failed to delete maintenance record"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-slate-500 text-sm font-medium">Loading maintenance records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maintenance Management</h1>
          <p className="text-sm text-slate-500 mt-1">Track, schedule, and manage all vehicle maintenance records</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          <FaPlus className="text-xs" />
          Add Maintenance
        </button>
      </div>

      {/* Statistics */}
      <MaintenanceStats records={records} />

      {/* Filters */}
      <MaintenanceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      {/* Table */}
      <MaintenanceTable
        records={filteredRecords}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onComplete={handleComplete}
        onDelete={handleOpenDelete}
      />

      {/* Modals */}
      <MaintenanceFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleFormSubmit}
        editingRecord={editingRecord}
        vehicles={vehicles}
      />

      <MaintenanceViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        record={selectedRecord}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, recordId: null, vehicleNumber: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Maintenance Record"
        message={`Are you sure you want to delete the maintenance record for vehicle ${deleteModal.vehicleNumber}? This action cannot be undone.`}
        isLoading={deleteLoading}
      />
    </div>
  );
}

export default Maintenance;