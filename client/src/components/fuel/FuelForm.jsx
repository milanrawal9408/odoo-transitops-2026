import React, { useEffect, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { createFuelLog, updateFuelLog } from "../../services/fuelService";
import { getVehicles } from "../../services/vehicleService";
import { getDrivers } from "../../services/driverService";
import {
  FaTimes,
  FaGasPump,
  FaTruck,
  FaUserTie,
  FaCalendarAlt,
  FaTachometerAlt,
  FaMapMarkerAlt,
  FaRuler,
  FaMoneyBillWave,
  FaCalculator,
  FaStickyNote,
} from "react-icons/fa";

const toDateInput = (isoStr) => {
  if (!isoStr) return "";
  return isoStr.slice(0, 10);
};

function FuelForm({ fuelLog, onClose, refreshFuelLogs }) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const isEdit = Boolean(fuelLog);

  // Watch quantity + pricePerLiter to auto-compute totalCost
  const quantity = useWatch({ control, name: "quantity" });
  const pricePerLiter = useWatch({ control, name: "pricePerLiter" });

  useEffect(() => {
    const q = parseFloat(quantity);
    const p = parseFloat(pricePerLiter);
    if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) {
      setValue("totalCost", (q * p).toFixed(2));
    } else {
      setValue("totalCost", "");
    }
  }, [quantity, pricePerLiter, setValue]);

  // Load vehicles + drivers for dropdowns
  const loadDropdowns = useCallback(async () => {
    setLoadingDropdowns(true);
    try {
      const [vRes, dRes] = await Promise.all([getVehicles(), getDrivers()]);
      setVehicles(vRes.data.vehicles || []);
      setDrivers(dRes.data.drivers || []);
    } catch (error) {
      toast.error("Failed to load vehicles/drivers");
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  useEffect(() => {
    loadDropdowns();
  }, [loadDropdowns]);

  // Populate form for edit ONLY after dropdown options are loaded successfully
  useEffect(() => {
    if (!loadingDropdowns) {
      if (fuelLog) {
        reset({
          vehicle: fuelLog.vehicle?._id || fuelLog.vehicle || "",
          driver: fuelLog.driver?._id || fuelLog.driver || "",
          fuelType: fuelLog.fuelType || "",
          quantity: fuelLog.quantity || "",
          pricePerLiter: fuelLog.pricePerLiter || "",
          totalCost: fuelLog.totalCost || "",
          odometerReading: fuelLog.odometerReading || "",
          fuelStation: fuelLog.fuelStation || "",
          fuelDate: toDateInput(fuelLog.fuelDate),
          remarks: fuelLog.remarks || "",
        });
      } else {
        reset({
          vehicle: "",
          driver: "",
          fuelType: "",
          quantity: "",
          pricePerLiter: "",
          totalCost: "",
          odometerReading: "",
          fuelStation: "",
          fuelDate: toDateInput(new Date().toISOString()),
          remarks: "",
        });
      }
    }
  }, [fuelLog, reset, loadingDropdowns]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        quantity: parseFloat(data.quantity),
        pricePerLiter: parseFloat(data.pricePerLiter),
        totalCost: parseFloat(data.totalCost),
        odometerReading: parseFloat(data.odometerReading),
      };

      if (isEdit) {
        await updateFuelLog(fuelLog._id, payload);
        toast.success("Fuel log updated successfully!");
      } else {
        await createFuelLog(payload);
        toast.success("Fuel log added successfully!");
      }
      refreshFuelLogs();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 transition-all border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white text-slate-800";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
  const errorClass = "text-xs text-red-500 mt-1 block font-medium";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FaGasPump className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isEdit ? "Edit Fuel Log" : "Add Fuel Log"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {isEdit ? "Update fuel refill record" : "Log a new fuel refill entry"}
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
          <form id="fuelLogForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section: Assignment */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaTruck /> Vehicle & Driver Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass} htmlFor="vehicle">
                    Vehicle <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="vehicle"
                    {...register("vehicle", { required: "Please select a vehicle" })}
                    disabled={loadingDropdowns}
                    className={inputClass}
                  >
                    <option value="">{loadingDropdowns ? "Loading..." : "Select vehicle"}</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.vehicleNumber} — {v.manufacturer} {v.model}
                      </option>
                    ))}
                  </select>
                  {errors.vehicle && (
                    <span className={errorClass}>{errors.vehicle.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="driver">
                    Driver <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="driver"
                    {...register("driver", { required: "Please select a driver" })}
                    disabled={loadingDropdowns}
                    className={inputClass}
                  >
                    <option value="">{loadingDropdowns ? "Loading..." : "Select driver"}</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.user?.fullName || "Unknown"} ({d.licenseNumber})
                      </option>
                    ))}
                  </select>
                  {errors.driver && (
                    <span className={errorClass}>{errors.driver.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Fuel Details */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaGasPump /> Refill Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    {["Petrol", "Diesel", "CNG", "Electric"].map((ft) => (
                      <option key={ft} value={ft}>
                        {ft}
                      </option>
                    ))}
                  </select>
                  {errors.fuelType && (
                    <span className={errorClass}>{errors.fuelType.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="fuelStation">
                    Fuel Station / Pump Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fuelStation"
                    type="text"
                    {...register("fuelStation", { required: "Fuel station name is required" })}
                    placeholder="e.g. HP Petrol Pump, SG Highway"
                    className={inputClass}
                  />
                  {errors.fuelStation && (
                    <span className={errorClass}>{errors.fuelStation.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="quantity">
                    Quantity (litres) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    step="0.01"
                    {...register("quantity", {
                      required: "Quantity is required",
                      min: { value: 0.01, message: "Must be greater than 0" },
                    })}
                    placeholder="e.g. 45.5"
                    className={inputClass}
                  />
                  {errors.quantity && (
                    <span className={errorClass}>{errors.quantity.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="pricePerLiter">
                    Price per Litre (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pricePerLiter"
                    type="number"
                    step="0.01"
                    {...register("pricePerLiter", {
                      required: "Price per litre is required",
                      min: { value: 0.01, message: "Must be greater than 0" },
                    })}
                    placeholder="e.g. 92.50"
                    className={inputClass}
                  />
                  {errors.pricePerLiter && (
                    <span className={errorClass}>{errors.pricePerLiter.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="totalCost">
                    Total Cost (₹) — Auto-calculated
                  </label>
                  <input
                    id="totalCost"
                    type="number"
                    step="0.01"
                    readOnly
                    {...register("totalCost", { required: "Total cost calculation is required" })}
                    placeholder="Auto-calculated"
                    className={`${inputClass} bg-slate-50 opacity-75 cursor-not-allowed`}
                  />
                  {errors.totalCost && (
                    <span className={errorClass}>{errors.totalCost.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="odometerReading">
                    Odometer Reading (km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="odometerReading"
                    type="number"
                    {...register("odometerReading", {
                      required: "Odometer reading is required",
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                    placeholder="e.g. 45230"
                    className={inputClass}
                  />
                  {errors.odometerReading && (
                    <span className={errorClass}>{errors.odometerReading.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="fuelDate">
                    Fuel Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fuelDate"
                    type="date"
                    {...register("fuelDate", { required: "Date is required" })}
                    className={inputClass}
                  />
                  {errors.fuelDate && (
                    <span className={errorClass}>{errors.fuelDate.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Remarks */}
            <div className="pt-4 border-t border-slate-100">
              <label className={labelClass} htmlFor="remarks">
                <span className="flex items-center gap-2"><FaStickyNote /> Additional Notes (optional)</span>
              </label>
              <textarea
                id="remarks"
                {...register("remarks")}
                rows={3}
                placeholder="Any additional notes about this fuel entry..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="fuelLogForm"
            disabled={isSubmitting || loadingDropdowns}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Update Log"
                : "Add Fuel Log"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FuelForm;
