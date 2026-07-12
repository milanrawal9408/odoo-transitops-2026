import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { createVehicle, updateVehicle } from "../../services/vehicleService";
import {
  FaTimes,
  FaTruck,
  FaGasPump,
  FaCalendarAlt,
  FaHashtag,
  FaIndustry,
  FaCar,
  FaWeight,
  FaTachometerAlt,
  FaClipboardList,
} from "react-icons/fa";

// Utility: convert ISO date string → "YYYY-MM-DD" for <input type="date">
const toDateInput = (isoStr) => {
  if (!isoStr) return "";
  return isoStr.slice(0, 10);
};

function VehicleForm({ vehicle, onClose, refreshVehicles }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: {} });

  // Populate form when editing
  useEffect(() => {
    if (vehicle) {
      reset({
        vehicleNumber: vehicle.vehicleNumber || "",
        vehicleType: vehicle.vehicleType || "",
        manufacturer: vehicle.manufacturer || "",
        model: vehicle.model || "",
        manufacturingYear: vehicle.manufacturingYear || "",
        fuelType: vehicle.fuelType || "",
        capacity: vehicle.capacity || "",
        status: vehicle.status || "Available",
        odometerReading: vehicle.odometerReading || 0,
        insuranceExpiry: toDateInput(vehicle.insuranceExpiry),
        pollutionExpiry: toDateInput(vehicle.pollutionExpiry),
        registrationExpiry: toDateInput(vehicle.registrationExpiry),
      });
    } else {
      reset({});
    }
  }, [vehicle, reset]);

  const onSubmit = async (data) => {
    try {
      if (vehicle) {
        await updateVehicle(vehicle._id, data);
        toast.success("Vehicle updated successfully!");
      } else {
        await createVehicle(data);
        toast.success("Vehicle added successfully!");
      }
      refreshVehicles();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const isEdit = Boolean(vehicle);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#0F172A", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-6"
          style={{
            background: "linear-gradient(135deg, #1E3A5F 0%, #1a2744 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: "rgba(59,130,246,0.2)" }}
            >
              <FaTruck className="text-blue-400 text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                {isEdit
                  ? `Updating ${vehicle.vehicleNumber}`
                  : "Register a new vehicle to the fleet"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all"
            style={{ background: "rgba(255,255,255,0.07)", color: "#94A3B8" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.2)";
              e.currentTarget.style.color = "#EF4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.color = "#94A3B8";
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6">
          {/* Section: Basic Info */}
          <SectionTitle icon={<FaTruck />} title="Basic Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormField
              label="Vehicle Number"
              error={errors.vehicleNumber}
              icon={<FaHashtag />}
            >
              <input
                {...register("vehicleNumber", {
                  required: "Vehicle number is required",
                })}
                placeholder="e.g. GJ01AB1234"
                disabled={isEdit}
                style={{
                  opacity: isEdit ? 0.6 : 1,
                  cursor: isEdit ? "not-allowed" : "text",
                }}
              />
            </FormField>

            <FormField
              label="Vehicle Type"
              error={errors.vehicleType}
              icon={<FaTruck />}
            >
              <select
                {...register("vehicleType", { required: "Vehicle type is required" })}
              >
                <option value="">Select type</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Bus">Bus</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Other">Other</option>
              </select>
            </FormField>

            <FormField
              label="Manufacturer"
              error={errors.manufacturer}
              icon={<FaIndustry />}
            >
              <input
                {...register("manufacturer", { required: "Manufacturer is required" })}
                placeholder="e.g. Tata, Mahindra"
              />
            </FormField>

            <FormField
              label="Model"
              error={errors.model}
              icon={<FaCar />}
            >
              <input
                {...register("model", { required: "Model is required" })}
                placeholder="e.g. Ace, Bolero"
              />
            </FormField>

            <FormField
              label="Manufacturing Year"
              error={errors.manufacturingYear}
              icon={<FaCalendarAlt />}
            >
              <input
                type="number"
                {...register("manufacturingYear", {
                  required: "Year is required",
                  min: { value: 1980, message: "Year must be ≥ 1980" },
                  max: {
                    value: new Date().getFullYear(),
                    message: "Year cannot be in the future",
                  },
                })}
                placeholder={`e.g. ${new Date().getFullYear()}`}
              />
            </FormField>

            <FormField
              label="Fuel Type"
              error={errors.fuelType}
              icon={<FaGasPump />}
            >
              <select
                {...register("fuelType", { required: "Fuel type is required" })}
              >
                <option value="">Select fuel type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
              </select>
            </FormField>

            <FormField
              label="Capacity"
              error={errors.capacity}
              icon={<FaWeight />}
            >
              <input
                type="number"
                {...register("capacity", {
                  required: "Capacity is required",
                  min: { value: 1, message: "Capacity must be at least 1" },
                })}
                placeholder="e.g. 5 (tons / seats)"
              />
            </FormField>

            {isEdit && (
              <FormField
                label="Status"
                error={errors.status}
                icon={<FaClipboardList />}
              >
                <select {...register("status")}>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </FormField>
            )}

            {isEdit && (
              <FormField
                label="Odometer Reading (km)"
                error={errors.odometerReading}
                icon={<FaTachometerAlt />}
              >
                <input
                  type="number"
                  {...register("odometerReading", {
                    min: { value: 0, message: "Cannot be negative" },
                  })}
                  placeholder="e.g. 12500"
                />
              </FormField>
            )}
          </div>

          {/* Section: Compliance Dates */}
          <SectionTitle icon={<FaCalendarAlt />} title="Compliance & Expiry Dates" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <FormField label="Insurance Expiry" error={errors.insuranceExpiry} icon={<FaCalendarAlt />}>
              <input type="date" {...register("insuranceExpiry")} />
            </FormField>
            <FormField label="Pollution (PUC) Expiry" error={errors.pollutionExpiry} icon={<FaCalendarAlt />}>
              <input type="date" {...register("pollutionExpiry")} />
            </FormField>
            <FormField label="Registration Expiry" error={errors.registrationExpiry} icon={<FaCalendarAlt />}>
              <input type="date" {...register("registrationExpiry")} />
            </FormField>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.07)",
                color: "#94A3B8",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-medium text-sm text-white transition-all flex items-center gap-2"
              style={{
                background: isSubmitting
                  ? "rgba(59,130,246,0.5)"
                  : "linear-gradient(135deg, #2563EB, #1D4ED8)",
                boxShadow: "0 4px 15px rgba(37,99,235,0.4)",
              }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isEdit ? "Updating..." : "Adding..."}
                </>
              ) : isEdit ? (
                "Update Vehicle"
              ) : (
                "Add Vehicle"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #E2E8F0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input::placeholder { color: #475569; }
        .form-input:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .form-input option { background: #1E293B; color: #E2E8F0; }
        .form-input::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); }
      `}</style>
    </div>
  );
}

// Reusable section title
function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span style={{ color: "#3B82F6", fontSize: "13px" }}>{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#64748B" }}>
        {title}
      </span>
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

// Reusable form field with icon + label + error
function FormField({ label, error, icon, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
        {label}
      </label>
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#475569", fontSize: "12px" }}
        >
          {icon}
        </span>
        {/* Clone child and add className */}
        {React.cloneElement(children, {
          className: "form-input",
        })}
      </div>
      {error && (
        <p className="mt-1 text-xs" style={{ color: "#F87171" }}>
          {error.message}
        </p>
      )}
    </div>
  );
}

export default VehicleForm;