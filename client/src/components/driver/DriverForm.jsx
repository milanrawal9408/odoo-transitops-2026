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
  } = useForm({ defaultValues: {} });

  const [driverUsers, setDriverUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isEdit = Boolean(driver);

  // Fetch available users for the dropdown (only on add mode)
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

  // Populate form for edit
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
      reset({});
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(5px)" }}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#0F172A", maxHeight: "92vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-6"
          style={{
            background: "linear-gradient(135deg, #1a2f50 0%, #0f1e35 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: "rgba(99,102,241,0.2)" }}
            >
              <FaUserTie style={{ color: "#818CF8", fontSize: "18px" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEdit ? "Edit Driver" : "Add New Driver"}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                {isEdit
                  ? `Updating ${driver.user?.fullName || "driver"}`
                  : "Register a new driver to your fleet"}
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

          {/* Section: User Assignment (Add only) */}
          {!isEdit && (
            <>
              <SectionTitle icon={<FaUser />} title="User Assignment" />
              <div className="mb-6">
                <FormField label="Select Driver User" error={errors.user} icon={<FaUser />}>
                  <select
                    {...register("user", { required: "Please select a user" })}
                    disabled={loadingUsers}
                  >
                    <option value="">
                      {loadingUsers ? "Loading users..." : "Select a Driver user"}
                    </option>
                    {driverUsers.map((u) => (
                      <option key={u._id} value={u._id} style={{ background: "#1E293B" }}>
                        {u.fullName} — {u.email}
                      </option>
                    ))}
                  </select>
                </FormField>
                {driverUsers.length === 0 && !loadingUsers && (
                  <p className="text-xs mt-2" style={{ color: "#EAB308" }}>
                    ⚠ No available Driver-role users. Register a user with the "Driver" role first.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Section: License Info */}
          <SectionTitle icon={<FaIdCard />} title="License Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormField label="License Number" error={errors.licenseNumber} icon={<FaIdCard />}>
              <input
                {...register("licenseNumber", { required: "License number is required" })}
                placeholder="e.g. GJ0120210012345"
                disabled={isEdit}
                style={{ opacity: isEdit ? 0.6 : 1, cursor: isEdit ? "not-allowed" : "text" }}
              />
            </FormField>

            <FormField label="License Expiry Date" error={errors.licenseExpiry} icon={<FaCalendarAlt />}>
              <input
                type="date"
                {...register("licenseExpiry", { required: "License expiry date is required" })}
              />
            </FormField>
          </div>

          {/* Section: Personal Details */}
          <SectionTitle icon={<FaUser />} title="Personal Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormField label="Date of Birth" error={errors.dateOfBirth} icon={<FaCalendarAlt />}>
              <input type="date" {...register("dateOfBirth")} />
            </FormField>

            <FormField label="Joining Date" error={errors.joiningDate} icon={<FaCalendarAlt />}>
              <input type="date" {...register("joiningDate")} />
            </FormField>

            <FormField label="Experience (years)" error={errors.experience} icon={<FaBriefcase />}>
              <input
                type="number"
                {...register("experience", {
                  min: { value: 0, message: "Cannot be negative" },
                })}
                placeholder="e.g. 5"
              />
            </FormField>

            {isEdit && (
              <FormField label="Status" error={errors.status} icon={<FaClipboardList />}>
                <select {...register("status")}>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </FormField>
            )}

            <div className="md:col-span-2">
              <FormField label="Address" error={errors.address} icon={<FaMapMarkerAlt />}>
                <input
                  {...register("address")}
                  placeholder="e.g. 123 Main Street, Ahmedabad"
                />
              </FormField>
            </div>
          </div>

          {/* Section: Emergency Contact */}
          <SectionTitle icon={<FaPhone />} title="Emergency Contact" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormField label="Contact Name" error={errors.emergencyContactName} icon={<FaUser />}>
              <input
                {...register("emergencyContactName")}
                placeholder="e.g. Ramesh Kumar"
              />
            </FormField>

            <FormField label="Contact Phone" error={errors.emergencyContactPhone} icon={<FaPhone />}>
              <input
                {...register("emergencyContactPhone")}
                placeholder="e.g. +91 98765 43210"
              />
            </FormField>
          </div>

          {/* Section: Remarks */}
          <SectionTitle icon={<FaStickyNote />} title="Additional Remarks" />
          <div className="mb-8">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
              Remarks
            </label>
            <textarea
              {...register("remarks")}
              rows={3}
              placeholder="Any additional notes about the driver..."
              className="form-input resize-none"
              style={{ paddingLeft: "12px" }}
            />
          </div>

          {/* Action Buttons */}
          <div
            className="flex items-center justify-end gap-3 pt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
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
                  ? "rgba(99,102,241,0.4)"
                  : "linear-gradient(135deg, #6366F1, #4F46E5)",
                boxShadow: isSubmitting ? "none" : "0 4px 15px rgba(99,102,241,0.4)",
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
                "Update Driver"
              ) : (
                "Add Driver"
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
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .form-input option { background: #1E293B; color: #E2E8F0; }
        .form-input::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); }
      `}</style>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span style={{ color: "#6366F1", fontSize: "13px" }}>{icon}</span>
      <span
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "#64748B" }}
      >
        {title}
      </span>
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

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
        {React.cloneElement(children, { className: "form-input" })}
      </div>
      {error && (
        <p className="mt-1 text-xs" style={{ color: "#F87171" }}>
          {error.message}
        </p>
      )}
    </div>
  );
}

export default DriverForm;
