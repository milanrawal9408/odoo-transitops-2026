import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSave, FaTimes, FaSpinner } from "react-icons/fa";
import { getVehicles } from "../../services/vehicleService";
import { getDrivers } from "../../services/driverService";
import dayjs from "dayjs";

function TripForm({ onSubmit, defaultValues, isEdit, isLoading, onCancel }) {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Load vehicles and drivers for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setDropdownsLoading(true);
        const [vehicleRes, driverRes] = await Promise.all([
          getVehicles(),
          getDrivers(),
        ]);
        setVehicles(vehicleRes.data.vehicles || []);
        setDrivers(driverRes.data.drivers || []);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
      } finally {
        setDropdownsLoading(false);
      }
    };
    fetchDropdownData();
  }, []);

  // Pre-fill form when editing
  useEffect(() => {
    if (defaultValues && !dropdownsLoading) {
      reset({
        vehicle: defaultValues.vehicle?._id || defaultValues.vehicle || "",
        driver: defaultValues.driver?._id || defaultValues.driver || "",
        source: defaultValues.source || "",
        destination: defaultValues.destination || "",
        departureTime: defaultValues.departureTime
          ? dayjs(defaultValues.departureTime).format("YYYY-MM-DDTHH:mm")
          : "",
        arrivalTime: defaultValues.arrivalTime
          ? dayjs(defaultValues.arrivalTime).format("YYYY-MM-DDTHH:mm")
          : "",
        distance: defaultValues.distance || "",
        cargoWeight: defaultValues.cargoWeight || "",
        status: defaultValues.status || "Scheduled",
        remarks: defaultValues.remarks || "",
      });
    }
  }, [defaultValues, dropdownsLoading, reset]);

  const inputClass =
    "w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white placeholder-slate-400";

  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  const errorClass = "text-red-500 text-xs mt-1 font-medium";

  if (dropdownsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner
            className="text-blue-500 text-3xl"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <p className="text-slate-500 text-sm">Loading form data...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Row 1: Vehicle & Driver */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            Vehicle <span className="text-red-400">*</span>
          </label>
          <select
            className={inputClass}
            {...register("vehicle", { required: "Vehicle is required" })}
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.vehicleNumber} — {v.vehicleType} ({v.manufacturer} {v.model})
              </option>
            ))}
          </select>
          {errors.vehicle && (
            <p className={errorClass}>{errors.vehicle.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Driver <span className="text-red-400">*</span>
          </label>
          <select
            className={inputClass}
            {...register("driver", { required: "Driver is required" })}
          >
            <option value="">Select Driver</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>
                {d.fullName} ({d.email})
              </option>
            ))}
          </select>
          {errors.driver && (
            <p className={errorClass}>{errors.driver.message}</p>
          )}
        </div>
      </div>

      {/* Row 2: Source & Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            Source <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Mumbai"
            className={inputClass}
            {...register("source", { required: "Source is required" })}
          />
          {errors.source && (
            <p className={errorClass}>{errors.source.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Destination <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Delhi"
            className={inputClass}
            {...register("destination", { required: "Destination is required" })}
          />
          {errors.destination && (
            <p className={errorClass}>{errors.destination.message}</p>
          )}
        </div>
      </div>

      {/* Row 3: Departure & Arrival */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            Departure Time <span className="text-red-400">*</span>
          </label>
          <input
            type="datetime-local"
            className={inputClass}
            {...register("departureTime", {
              required: "Departure time is required",
            })}
          />
          {errors.departureTime && (
            <p className={errorClass}>{errors.departureTime.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Arrival Time</label>
          <input
            type="datetime-local"
            className={inputClass}
            {...register("arrivalTime")}
          />
        </div>
      </div>

      {/* Row 4: Distance, Cargo Weight & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className={labelClass}>
            Distance (km) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g. 1400"
            className={inputClass}
            {...register("distance", {
              required: "Distance is required",
              min: { value: 0, message: "Distance must be positive" },
            })}
          />
          {errors.distance && (
            <p className={errorClass}>{errors.distance.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Cargo Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g. 5000"
            className={inputClass}
            {...register("cargoWeight", {
              min: { value: 0, message: "Weight must be positive" },
            })}
          />
          {errors.cargoWeight && (
            <p className={errorClass}>{errors.cargoWeight.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            className={inputClass}
            {...register("status")}
          >
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Row 5: Remarks */}
      <div>
        <label className={labelClass}>Remarks</label>
        <textarea
          rows={3}
          placeholder="Any additional notes about this trip..."
          className={inputClass + " resize-none"}
          {...register("remarks")}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
        >
          {isLoading ? (
            <>
              <FaSpinner
                className="text-sm"
                style={{ animation: "spin 0.6s linear infinite" }}
              />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <FaSave className="text-sm" />
              {isEdit ? "Update Trip" : "Create Trip"}
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            <FaTimes className="text-sm" />
            Cancel
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}

export default TripForm;
