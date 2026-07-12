import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaTimes, FaUserShield } from "react-icons/fa";

const ROLES = [
  "Admin",
  "Fleet Manager",
  "Driver",
  "Safety Officer",
  "Financial Analyst",
];

const ROLE_CLASSES = {
  Admin: "bg-red-50 text-red-700 border-red-200",
  "Fleet Manager": "bg-blue-50 text-blue-700 border-blue-200",
  Driver: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Safety Officer": "bg-amber-50 text-amber-700 border-amber-200",
  "Financial Analyst": "bg-purple-50 text-purple-700 border-purple-200",
};

function EditRoleModal({ user, onSave, onClose, saving }) {
  const { register, handleSubmit, reset, watch } = useForm();
  const selectedRole = watch("role");

  useEffect(() => {
    if (user) {
      reset({ role: user.role });
    }
  }, [user, reset]);

  if (!user) return null;

  const onSubmit = (data) => {
    onSave(user._id, data.role);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FaUserShield className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Edit User Role</h2>
              <p className="text-sm text-slate-500 mt-0.5">{user.fullName}</p>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Current Role
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg border ${
                  ROLE_CLASSES[user.role] || "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {user.role}
              </span>
            </div>

            <div>
              <label htmlFor="role-select" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Select New Role
              </label>
              <select
                id="role-select"
                {...register("role", { required: "Please select a role" })}
                className="w-full px-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 transition-all border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white text-slate-800"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || selectedRole === user.role}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRoleModal;
