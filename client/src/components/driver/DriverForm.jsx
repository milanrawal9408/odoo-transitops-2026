import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  createDriver,
  updateDriver,
  getDriverUsers,
} from "../../services/driverService";
import {
  FaTimes,
  FaUserTie,
  FaIdCard,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBriefcase,
  FaPhone,
  FaUser,
  FaStickyNote,
  FaClipboardList,
} from "react-icons/fa";

const toDateInput = (isoStr) => {
  if (!isoStr) return "";
  return isoStr.slice(0, 10);
};

function DriverForm({ driver, onClose, refreshDrivers }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [driverUsers, setDriverUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isEdit = Boolean(driver);

  useEffect(() => {
    if (!isEdit) {
      fetchDriverUsers();
    }
  }, [isEdit]);

  const fetchDriverUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await getDriverUsers();
      setDriverUsers(res.data.users || []);
    } catch {
      toast.error("Failed to load available users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (driver) {
      reset({
        licenseNumber: driver.licenseNumber || "",
        licenseExpiry: toDateInput(driver.licenseExpiry),
        address: driver.address || "",
        dateOfBirth: toDateInput(driver.dateOfBirth),
        joiningDate: toDateInput(driver.joiningDate),
        experience: driver.experience ?? 0,
        status: driver.status || "Available",
        emergencyContactName: driver.emergencyContactName || "",
        emergencyContactPhone: driver.emergencyContactPhone || "",
        remarks: driver.remarks || "",
      });
    } else {
      reset({
        licenseNumber: "",
        licenseExpiry: "",
        address: "",
        dateOfBirth: "",
        joiningDate: "",
        experience: 0,
        status: "Available",
        emergencyContactName: "",
        emergencyContactPhone: "",
        remarks: "",
      });
    }
  }, [driver, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateDriver(driver._id, data);
        toast.success("Driver updated successfully!");
      } else {
        await createDriver(data);
        toast.success("Driver added successfully!");
      }
      refreshDrivers();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <FaUserTie className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isEdit ? "Edit Driver" : "Add New Driver"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {isEdit
                  ? `Updating ${driver.user?.fullName || "driver"}`
                  : "Register a new driver to your fleet"}
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
          <form id="driverForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section: User Assignment (Add only) */}
            {!isEdit && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaUser /> User Assignment
                </h3>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className={labelClass} htmlFor="assignUser">
                      Select Driver User <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="assignUser"
                      {...register("user", { required: "Please select a user" })}
                      disabled={loadingUsers}
                      className={inputClass}
                    >
                      <option value="">
                        {loadingUsers ? "Loading users..." : "Select a Driver user"}
                      </option>
                      {driverUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.fullName} — {u.email}
                        </option>
                      ))}
                    </select>
                    {errors.user && (
                      <span className={errorClass}>{errors.user.message}</span>
                    )}
                    {driverUsers.length === 0 && !loadingUsers && (
                      <p className="text-xs mt-2 text-amber-600 font-medium">
                        ⚠ No available Driver-role users. Register a user with the "Driver" role first.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section: License Info */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaIdCard /> License Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass} htmlFor="licenseNumber">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="licenseNumber"
                    type="text"
                    {...register("licenseNumber", { required: "License number is required" })}
                    placeholder="e.g. GJ0120210012345"
                    disabled={isEdit}
                    className={`${inputClass} ${isEdit ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}`}
                  />
                  {errors.licenseNumber && (
                    <span className={errorClass}>{errors.licenseNumber.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="licenseExpiry">
                    License Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="licenseExpiry"
                    type="date"
                    {...register("licenseExpiry", { required: "License expiry date is required" })}
                    className={inputClass}
                  />
                  {errors.licenseExpiry && (
                    <span className={errorClass}>{errors.licenseExpiry.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Personal Details */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaUser /> Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass} htmlFor="dateOfBirth">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="joiningDate">
                    Joining Date
                  </label>
                  <input
                    id="joiningDate"
                    type="date"
                    {...register("joiningDate")}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="experience">
                    Experience (years)
                  </label>
                  <input
                    id="experience"
                    type="number"
                    {...register("experience", {
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                    placeholder="e.g. 5"
                    className={inputClass}
                  />
                  {errors.experience && (
                    <span className={errorClass}>{errors.experience.message}</span>
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
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className={labelClass} htmlFor="address">
                    Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    {...register("address")}
                    placeholder="e.g. 123 Main Street, Ahmedabad"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Section: Emergency Contact */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaPhone /> Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass} htmlFor="emergencyContactName">
                    Contact Name
                  </label>
                  <input
                    id="emergencyContactName"
                    type="text"
                    {...register("emergencyContactName")}
                    placeholder="e.g. Ramesh Kumar"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="emergencyContactPhone">
                    Contact Phone
                  </label>
                  <input
                    id="emergencyContactPhone"
                    type="text"
                    {...register("emergencyContactPhone")}
                    placeholder="e.g. +91 98765 43210"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Section: Remarks */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaStickyNote /> Additional Remarks
              </h3>
              <div>
                <label className={labelClass} htmlFor="remarks">
                  Remarks
                </label>
                <textarea
                  id="remarks"
                  {...register("remarks")}
                  rows={3}
                  placeholder="Any additional notes about the driver..."
                  className={`${inputClass} resize-none`}
                />
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
            form="driverForm"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-md shadow-indigo-500/20"
          >
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Update Driver"
                : "Add Driver"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DriverForm;
