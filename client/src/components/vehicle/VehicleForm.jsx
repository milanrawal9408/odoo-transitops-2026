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
  } = useForm();

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
      reset({
        vehicleNumber: "",
        vehicleType: "",
        manufacturer: "",
        model: "",
        manufacturingYear: "",
        fuelType: "",
        capacity: "",
        status: "Available",
        odometerReading: 0,
        insuranceExpiry: "",
        pollutionExpiry: "",
        registrationExpiry: "",
      });
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
  const inputClass =
    "w-full px-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 transition-all border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white text-slate-800";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
  const errorClass = "text-xs text-red-500 mt-1 block font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FaTruck className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {isEdit
                  ? `Updating vehicle ${vehicle.vehicleNumber}`
                  : "Register a new vehicle to the fleet"}
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

        {/* Body */}
        <div className="overflow-y-auto p-6">
          <form id="vehicleForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section: Basic Info */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaTruck /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass} htmlFor="vehicleNumber">
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="vehicleNumber"
                    type="text"
                    {...register("vehicleNumber", { required: "Vehicle number is required" })}
                    placeholder="e.g. GJ01AB1234"
                    disabled={isEdit}
                    className={`${inputClass} ${isEdit ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}`}
                  />
                  {errors.vehicleNumber && (
                    <span className={errorClass}>{errors.vehicleNumber.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="vehicleType">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="vehicleType"
                    {...register("vehicleType", { required: "Vehicle type is required" })}
                    className={inputClass}
                  >
                    <option value="">Select type</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Bus">Bus</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.vehicleType && (
                    <span className={errorClass}>{errors.vehicleType.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="manufacturer">
                    Manufacturer <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="manufacturer"
                    type="text"
                    {...register("manufacturer", { required: "Manufacturer is required" })}
                    placeholder="e.g. Tata, Mahindra"
                    className={inputClass}
                  />
                  {errors.manufacturer && (
                    <span className={errorClass}>{errors.manufacturer.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="model">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="model"
                    type="text"
                    {...register("model", { required: "Model is required" })}
                    placeholder="e.g. Ace, Bolero"
                    className={inputClass}
                  />
                  {errors.model && (
                    <span className={errorClass}>{errors.model.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="manufacturingYear">
                    Manufacturing Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="manufacturingYear"
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
                    className={inputClass}
                  />
                  {errors.manufacturingYear && (
                    <span className={errorClass}>{errors.manufacturingYear.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="fuelType">
                    Fuel Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="fuelType"
                    {...register("fuelType", { required: "Fuel type is required" })}
                    className={inputClass}
                  >
                    <option value="">Select fuel type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                  </select>
                  {errors.fuelType && (
                    <span className={errorClass}>{errors.fuelType.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="capacity">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="capacity"
                    type="number"
                    {...register("capacity", {
                      required: "Capacity is required",
                      min: { value: 1, message: "Capacity must be at least 1" },
                    })}
                    placeholder="e.g. 5 (tons / seats)"
                    className={inputClass}
                  />
                  {errors.capacity && (
                    <span className={errorClass}>{errors.capacity.message}</span>
                  )}
                </div>

                {isEdit && (
                  <div>
                    <label className={labelClass} htmlFor="status">
                      Status
                    </label>
                    <select id="status" {...register("status")} className={inputClass}>
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Out of Service">Out of Service</option>
                    </select>
                  </div>
                )}

                {isEdit && (
                  <div>
                    <label className={labelClass} htmlFor="odometerReading">
                      Odometer Reading (km)
                    </label>
                    <input
                      id="odometerReading"
                      type="number"
                      {...register("odometerReading", {
                        min: { value: 0, message: "Cannot be negative" },
                      })}
                      placeholder="e.g. 12500"
                      className={inputClass}
                    />
                    {errors.odometerReading && (
                      <span className={errorClass}>{errors.odometerReading.message}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section: Compliance Dates */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaCalendarAlt /> Compliance & Expiry Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass} htmlFor="insuranceExpiry">
                    Insurance Expiry
                  </label>
                  <input
                    id="insuranceExpiry"
                    type="date"
                    {...register("insuranceExpiry")}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="pollutionExpiry">
                    Pollution (PUC) Expiry
                  </label>
                  <input
                    id="pollutionExpiry"
                    type="date"
                    {...register("pollutionExpiry")}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="registrationExpiry">
                    Registration Expiry
                  </label>
                  <input
                    id="registrationExpiry"
                    type="date"
                    {...register("registrationExpiry")}
                    className={inputClass}
                  />
                </div>
              </div>
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
            form="vehicleForm"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-md shadow-blue-500/20"
          >
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Update Vehicle"
                : "Add Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VehicleForm;