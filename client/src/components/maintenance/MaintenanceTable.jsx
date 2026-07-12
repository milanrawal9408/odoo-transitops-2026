import dayjs from "dayjs";
import {
  FaEye,
  FaEdit,
  FaCheckCircle,
  FaTrash,
  FaWrench,
} from "react-icons/fa";

function MaintenanceTable({
  records,
  onView,
  onEdit,
  onComplete,
  onDelete,
}) {
  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "maint-badge-pending";
      case "In Progress":
        return "maint-badge-progress";
      case "Completed":
        return "maint-badge-completed";
      default:
        return "";
    }
  };

  if (records.length === 0) {
    return (
      <div className="maint-empty-state">
        <div className="maint-empty-icon">
          <FaWrench />
        </div>
        <h3>No Maintenance Records Found</h3>
        <p>Try adjusting your filters or add a new maintenance record.</p>
      </div>
    );
  }

  return (
    <div className="maint-table-wrapper">
      <table className="maint-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Type</th>
            <th>Technician</th>
            <th>Cost</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={record._id} className="maint-table-row" style={{ animationDelay: `${index * 0.03}s` }}>
              <td>
                <div className="maint-vehicle-cell">
                  <span className="maint-vehicle-number">
                    {record.vehicle?.vehicleNumber || "N/A"}
                  </span>
                  <span className="maint-vehicle-type">
                    {record.vehicle?.vehicleType || ""}
                  </span>
                </div>
              </td>
              <td>
                <span className="maint-type-tag">{record.maintenanceType}</span>
              </td>
              <td>{record.technician || "—"}</td>
              <td className="maint-cost-cell">
                ₹{(record.cost || 0).toLocaleString("en-IN")}
              </td>
              <td>{dayjs(record.startDate).format("DD MMM YYYY")}</td>
              <td>
                {record.endDate
                  ? dayjs(record.endDate).format("DD MMM YYYY")
                  : "—"}
              </td>
              <td>
                <span className={`maint-badge ${getStatusClass(record.status)}`}>
                  {record.status}
                </span>
              </td>
              <td>
                <div className="maint-actions">
                  <button
                    className="maint-action-btn maint-action-view"
                    onClick={() => onView(record)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>

                  {record.status !== "Completed" && (
                    <button
                      className="maint-action-btn maint-action-edit"
                      onClick={() => onEdit(record)}
                      title="Edit Record"
                    >
                      <FaEdit />
                    </button>
                  )}

                  {record.status !== "Completed" && (
                    <button
                      className="maint-action-btn maint-action-complete"
                      onClick={() => onComplete(record)}
                      title="Mark Complete"
                    >
                      <FaCheckCircle />
                    </button>
                  )}

                  <button
                    className="maint-action-btn maint-action-delete"
                    onClick={() => onDelete(record)}
                    title="Delete Record"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MaintenanceTable;
