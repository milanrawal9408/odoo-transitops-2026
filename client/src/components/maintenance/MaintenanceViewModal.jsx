import dayjs from "dayjs";
import { FaTimes, FaInfoCircle, FaWrench } from "react-icons/fa";

const STATUS_CONFIG = {
  Pending: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "In Progress": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  Completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
};

function Field({ label, value, valueClass = "" }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-sm font-medium text-slate-800 ${valueClass}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function MaintenanceViewModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  const statusCfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.Pending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FaInfoCircle className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Maintenance Details
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Record #{record._id?.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Vehicle + Status banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <FaWrench className="text-blue-500 text-sm" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  {record.vehicle?.vehicleNumber || "N/A"}
                </p>
                <p className="text-xs text-slate-400">
                  {record.vehicle?.vehicleType || ""}
                  {record.vehicle?.manufacturer
                    ? ` · ${record.vehicle.manufacturer} ${record.vehicle.model}`
                    : ""}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {record.status}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-5">
            <Field label="Maintenance Type" value={record.maintenanceType} />
            <Field
              label="Cost"
              value={`₹${(record.cost || 0).toLocaleString("en-IN")}`}
              valueClass="text-blue-700 font-bold"
            />
            <Field
              label="Start Date"
              value={dayjs(record.startDate).format("DD MMM YYYY")}
            />
            <Field
              label="End Date"
              value={
                record.endDate
                  ? dayjs(record.endDate).format("DD MMM YYYY")
                  : null
              }
            />
            <Field label="Technician" value={record.technician} />
            <Field
              label="Created By"
              value={record.createdBy?.fullName}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Description
            </span>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
              {record.description || "—"}
            </p>
          </div>

          {/* Remarks */}
          {record.remarks && (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Remarks
              </span>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                {record.remarks}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex flex-col sm:flex-row gap-3 text-xs text-slate-400 pt-3 border-t border-slate-100">
            <span>
              <span className="font-semibold text-slate-500">Created:</span>{" "}
              {dayjs(record.createdAt).format("DD MMM YYYY, h:mm A")}
            </span>
            <span className="hidden sm:block">·</span>
            <span>
              <span className="font-semibold text-slate-500">Updated:</span>{" "}
              {dayjs(record.updatedAt).format("DD MMM YYYY, h:mm A")}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceViewModal;
