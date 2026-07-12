import dayjs from "dayjs";
import {
  FaEye,
  FaEdit,
  FaCheckCircle,
  FaTrash,
  FaWrench,
} from "react-icons/fa";

const STATUS_CONFIG = {
  Pending: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "In Progress": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

function MaintenanceTable({
  records,
  onView,
  onEdit,
  onComplete,
  onDelete,
}) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center text-slate-400">
        <FaWrench className="text-5xl mb-4 text-slate-300" />
        <p className="text-lg font-semibold text-slate-500">No maintenance records found</p>
        <p className="text-sm mt-1">Try adjusting your filters or add a new maintenance record.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Vehicle", "Type", "Technician", "Cost", "Start Date", "End Date", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.map((record) => {
              const statusCfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.Pending;

              return (
                <tr
                  key={record._id}
                  className="hover:bg-blue-50/40 transition-colors duration-150"
                >
                  {/* Vehicle */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FaWrench className="text-blue-500 text-sm" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {record.vehicle?.vehicleNumber || "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {record.vehicle?.vehicleType || ""}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                      {record.maintenanceType}
                    </span>
                  </td>

                  {/* Technician */}
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {record.technician || "—"}
                  </td>

                  {/* Cost */}
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                    ₹{(record.cost || 0).toLocaleString("en-IN")}
                  </td>

                  {/* Start Date */}
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {dayjs(record.startDate).format("DD MMM YYYY")}
                  </td>

                  {/* End Date */}
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {record.endDate
                      ? dayjs(record.endDate).format("DD MMM YYYY")
                      : "—"}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {record.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 cursor-pointer"
                        onClick={() => onView(record)}
                        title="View Details"
                      >
                        <FaEye className="text-sm" />
                      </button>

                      {record.status !== "Completed" && (
                        <button
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 cursor-pointer"
                          onClick={() => onEdit(record)}
                          title="Edit Record"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                      )}

                      {record.status !== "Completed" && (
                        <button
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 cursor-pointer"
                          onClick={() => onComplete(record)}
                          title="Mark Complete"
                        >
                          <FaCheckCircle className="text-sm" />
                        </button>
                      )}

                      <button
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer"
                        onClick={() => onDelete(record)}
                        title="Delete Record"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MaintenanceTable;
