import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaTimes, FaWrench } from "react-icons/fa";
import dayjs from "dayjs";

function MaintenanceFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingRecord,
  vehicles,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (editingRecord) {
      reset({
        vehicle: editingRecord.vehicle?._id || editingRecord.vehicle || "",
        maintenanceType: editingRecord.maintenanceType || "",
        description: editingRecord.description || "",
        cost: editingRecord.cost || "",
        startDate: editingRecord.startDate
          ? dayjs(editingRecord.startDate).format("YYYY-MM-DD")
          : "",
        endDate: editingRecord.endDate
          ? dayjs(editingRecord.endDate).format("YYYY-MM-DD")
          : "",
        technician: editingRecord.technician || "",
        remarks: editingRecord.remarks || "",
        status: editingRecord.status || "Pending",
      });
    } else {
      reset({
        vehicle: "",
        maintenanceType: "",
        description: "",
        cost: "",
        startDate: dayjs().format("YYYY-MM-DD"),
        endDate: "",
        technician: "",
        remarks: "",
        status: "Pending",
      });
    }
  }, [editingRecord, reset]);

  const maintenanceTypes = [
    "Oil Change",
    "Tire Replacement",
    "Engine Repair",
    "Brake Service",
    "Battery Replacement",
    "AC Service",
    "General Service",
    "Other",
  ];

  const handleFormSubmit = (data) => {
    const payload = {
      ...data,
      cost: parseFloat(data.cost) || 0,
      endDate: data.endDate || null,
    };
    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="maint-modal-overlay" onClick={onClose}>
      <div
        className="maint-modal maint-modal-form"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="maint-modal-header">
          <div className="maint-modal-header-title">
            <div className="maint-modal-header-icon">
              <FaWrench />
            </div>
            <div>
              <h2>{editingRecord ? "Edit Maintenance" : "New Maintenance"}</h2>
              <p>
                {editingRecord
                  ? "Update the maintenance record details"
                  : "Schedule a new maintenance record"}
              </p>
            </div>
          </div>
          <button
            className="maint-modal-close"
            onClick={onClose}
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="maint-form">
          <div className="maint-form-grid">
            {/* Vehicle */}
            <div className="maint-form-group">
              <label htmlFor="form-vehicle">
                Vehicle <span className="maint-required">*</span>
              </label>
              <select
                id="form-vehicle"
                {...register("vehicle", { required: "Vehicle is required" })}
                className={`maint-form-input ${errors.vehicle ? "maint-input-error" : ""}`}
                disabled={!!editingRecord}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber} — {v.vehicleType} ({v.manufacturer}{" "}
                    {v.model})
                  </option>
                ))}
              </select>
              {errors.vehicle && (
                <span className="maint-error-msg">{errors.vehicle.message}</span>
              )}
            </div>

            {/* Maintenance Type */}
            <div className="maint-form-group">
              <label htmlFor="form-type">
                Maintenance Type <span className="maint-required">*</span>
              </label>
              <select
                id="form-type"
                {...register("maintenanceType", {
                  required: "Type is required",
                })}
                className={`maint-form-input ${errors.maintenanceType ? "maint-input-error" : ""}`}
              >
                <option value="">Select type</option>
                {maintenanceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.maintenanceType && (
                <span className="maint-error-msg">
                  {errors.maintenanceType.message}
                </span>
              )}
            </div>

            {/* Technician */}
            <div className="maint-form-group">
              <label htmlFor="form-technician">Technician</label>
              <input
                id="form-technician"
                type="text"
                placeholder="Enter technician name"
                {...register("technician")}
                className="maint-form-input"
              />
            </div>

            {/* Cost */}
            <div className="maint-form-group">
              <label htmlFor="form-cost">
                Cost (₹) <span className="maint-required">*</span>
              </label>
              <input
                id="form-cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("cost", {
                  required: "Cost is required",
                  min: { value: 0, message: "Cost must be positive" },
                })}
                className={`maint-form-input ${errors.cost ? "maint-input-error" : ""}`}
              />
              {errors.cost && (
                <span className="maint-error-msg">{errors.cost.message}</span>
              )}
            </div>

            {/* Start Date */}
            <div className="maint-form-group">
              <label htmlFor="form-start-date">
                Start Date <span className="maint-required">*</span>
              </label>
              <input
                id="form-start-date"
                type="date"
                {...register("startDate", {
                  required: "Start date is required",
                })}
                className={`maint-form-input ${errors.startDate ? "maint-input-error" : ""}`}
              />
              {errors.startDate && (
                <span className="maint-error-msg">
                  {errors.startDate.message}
                </span>
              )}
            </div>

            {/* End Date */}
            <div className="maint-form-group">
              <label htmlFor="form-end-date">End Date</label>
              <input
                id="form-end-date"
                type="date"
                {...register("endDate")}
                className="maint-form-input"
              />
            </div>

            {/* Status (only for editing) */}
            {editingRecord && (
              <div className="maint-form-group">
                <label htmlFor="form-status">Status</label>
                <select
                  id="form-status"
                  {...register("status")}
                  className="maint-form-input"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          {/* Description - Full width */}
          <div className="maint-form-group maint-form-full">
            <label htmlFor="form-description">
              Description <span className="maint-required">*</span>
            </label>
            <textarea
              id="form-description"
              rows={3}
              placeholder="Describe the maintenance work needed..."
              {...register("description", {
                required: "Description is required",
              })}
              className={`maint-form-input maint-form-textarea ${errors.description ? "maint-input-error" : ""}`}
            />
            {errors.description && (
              <span className="maint-error-msg">
                {errors.description.message}
              </span>
            )}
          </div>

          {/* Remarks - Full width */}
          <div className="maint-form-group maint-form-full">
            <label htmlFor="form-remarks">Remarks</label>
            <textarea
              id="form-remarks"
              rows={2}
              placeholder="Any additional notes..."
              {...register("remarks")}
              className="maint-form-input maint-form-textarea"
            />
          </div>

          {/* Actions */}
          <div className="maint-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="maint-btn maint-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="maint-btn maint-btn-primary"
            >
              {isSubmitting
                ? "Saving..."
                : editingRecord
                  ? "Update Record"
                  : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MaintenanceFormModal;
