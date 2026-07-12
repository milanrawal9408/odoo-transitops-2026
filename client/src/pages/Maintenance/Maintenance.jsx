import { useState, useEffect, useCallback, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import MaintenanceStats from "../../components/maintenance/MaintenanceStats";
import MaintenanceFilters from "../../components/maintenance/MaintenanceFilters";
import MaintenanceTable from "../../components/maintenance/MaintenanceTable";
import MaintenanceFormModal from "../../components/maintenance/MaintenanceFormModal";
import MaintenanceViewModal from "../../components/maintenance/MaintenanceViewModal";
import DeleteConfirmModal from "../../components/maintenance/DeleteConfirmModal";

import {
  getAllMaintenances,
  createMaintenance,
  updateMaintenance,
  completeMaintenance,
  deleteMaintenance,
} from "../../services/maintenanceService";
import { getVehicles } from "../../services/vehicleService";

import "./maintenance.css";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

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

      // Fetch maintenance and vehicles independently so one failure doesn't block the other
      let maintenanceData = [];
      let vehicleData = [];

      try {
        const maintRes = await getAllMaintenances();
        maintenanceData = maintRes.data.maintenances || [];
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
        // Vehicle fetch failure is non-critical, just log it
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
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
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
    try {
      await deleteMaintenance(selectedRecord._id);
      toast.success("Maintenance record deleted successfully");
      handleCloseModals();
      fetchData();
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error.response?.data?.message || "Failed to delete maintenance record"
      );
    }
  };

  // ── Render ──
  if (loading) {
    return (
      <div className="maint-loading">
        <div className="maint-loading-spinner" />
        <span>Loading maintenance records...</span>
      </div>
    );
  }

  return (
    <div className="maint-page">
      {/* Page Header */}
      <div className="maint-page-header">
        <div>
          <h1>🔧 Maintenance Management</h1>
          <p>Track, schedule, and manage all vehicle maintenance records</p>
        </div>
        <button
          id="maintenance-add-btn"
          className="maint-add-btn"
          onClick={handleOpenCreate}
        >
          <FaPlus />
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

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteConfirm}
        record={selectedRecord}
      />
    </div>
  );
}

export default Maintenance;