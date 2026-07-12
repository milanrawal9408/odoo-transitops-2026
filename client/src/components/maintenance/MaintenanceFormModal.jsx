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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FaWrench className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {editingRecord ? "Edit Maintenance" : "New Maintenance"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {editingRecord
                  ? "Update the maintenance record details"
                  : "Schedule a new maintenance record"}
              </p>
            </div>
          </div>
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
            onClick={onClose}
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-6">
          <form id="maintenanceForm" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="form-vehicle">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  id="form-vehicle"
                  {...register("vehicle", { required: "Vehicle is required" })}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 transition-all ${
                    errors.vehicle
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  disabled={!!editingRecord}
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.vehicleNumber} — {v.vehicleType} ({v.manufacturer} {v.model})
                    </option>
                  ))}
                </select>
                {errors.vehicle && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.vehicle.message}</span>
                )}
              </div>

              {/* Maintenance Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="form-type">
                  Maintenance Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="form-type"
                  {...register("maintenanceType", { required: "Type is required" })}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 transition-all ${
                    errors.maintenanceType
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                >
                  <option value="">Select type</option>
                  {maintenanceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.maintenanceType && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {errors.maintenanceType.message}
                  </span>
                )}
              </div>

              {/* Technician */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="form-technician">
                  Technician
                </label>
                <input
                  id="form-technician"
                  type="text"
                  placeholder="Enter technician name"
                  {...register("technician")}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="form-cost">
                  Cost (₹) <span className="text-red-500">*</span>
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
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 transition-all ${
                    errors.cost
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />
                {errors.cost && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.cost.message}</span>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="form-start-date">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-start-date"
                  type="date"
                  {...register("startDate", { required: "Start date is required" })}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 transition-all ${
                    errors.startDate
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />
                {errors.startDate && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {errors.startDate.message}
                  </span>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="form-end-date">
                  End Date
                </label>
                <input
                  id="form-end-date"
                  type="date"
                  {...register("endDate")}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Status (only for editing) */}
              {editingRecord && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="form-status">
                    Status
                  </label>
                  <select
                    id="form-status"
                    {...register("status")}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}
            </div>

            {/* Description - Full width */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="form-description">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="form-description"
                rows={3}
                placeholder="Describe the maintenance work needed..."
                {...register("description", { required: "Description is required" })}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 transition-all resize-none ${
                  errors.description
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
              />
              {errors.description && (
                <span className="text-xs text-red-500 mt-1 block">
                  {errors.description.message}
                </span>
              )}
            </div>

            {/* Remarks - Full width */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="form-remarks">
                Remarks
              </label>
              <textarea
                id="form-remarks"
                rows={2}
                placeholder="Any additional notes..."
                {...register("remarks")}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="maintenanceForm"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-md shadow-blue-500/20"
          >
            {isSubmitting
              ? "Saving..."
              : editingRecord
                ? "Update Record"
                : "Create Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceFormModal;
