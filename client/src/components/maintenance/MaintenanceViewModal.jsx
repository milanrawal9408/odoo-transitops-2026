import dayjs from "dayjs";
import { FaTimes, FaInfoCircle } from "react-icons/fa";

function MaintenanceViewModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

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

  return (
    <div className="maint-modal-overlay" onClick={onClose}>
      <div
        className="maint-modal maint-modal-view"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="maint-modal-header">
          <div className="maint-modal-header-title">
            <div className="maint-modal-header-icon maint-modal-header-icon-view">
              <FaInfoCircle />
            </div>
            <div>
              <h2>Maintenance Details</h2>
              <p>Record #{record._id?.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <button className="maint-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="maint-view-content">
          <div className="maint-view-grid">
            <div className="maint-view-field">
              <span className="maint-view-label">Vehicle</span>
              <span className="maint-view-value">
                {record.vehicle?.vehicleNumber || "N/A"}{" "}
                <span className="maint-view-sub">
                  ({record.vehicle?.vehicleType || "—"})
                </span>
              </span>
            </div>

            <div className="maint-view-field">
              <span className="maint-view-label">Maintenance Type</span>
              <span className="maint-view-value">
                {record.maintenanceType}
              </span>
            </div>

            <div className="maint-view-field">
              <span className="maint-view-label">Status</span>
              <span className="maint-view-value">
                <span
                  className={`maint-badge ${getStatusClass(record.status)}`}
                >
                  {record.status}
                </span>
              </span>
            </div>

            <div className="maint-view-field">
              <span className="maint-view-label">Cost</span>
              <span className="maint-view-value maint-view-cost">
                ₹{(record.cost || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="maint-view-field">
              <span className="maint-view-label">Start Date</span>
              <span className="maint-view-value">
                {dayjs(record.startDate).format("DD MMM YYYY")}
              </span>
            </div>

            <div className="maint-view-field">
              <span className="maint-view-label">End Date</span>
              <span className="maint-view-value">
                {record.endDate
                  ? dayjs(record.endDate).format("DD MMM YYYY")
                  : "—"}
              </span>
            </div>

            <div className="maint-view-field">
              <span className="maint-view-label">Technician</span>
              <span className="maint-view-value">
                {record.technician || "—"}
              </span>
            </div>

            <div className="maint-view-field">
              <span className="maint-view-label">Created By</span>
              <span className="maint-view-value">
                {record.createdBy?.fullName || "—"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="maint-view-section">
            <span className="maint-view-label">Description</span>
            <p className="maint-view-text">{record.description || "—"}</p>
          </div>

          {/* Remarks */}
          {record.remarks && (
            <div className="maint-view-section">
              <span className="maint-view-label">Remarks</span>
              <p className="maint-view-text">{record.remarks}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="maint-view-timestamps">
            <span>
              Created: {dayjs(record.createdAt).format("DD MMM YYYY, h:mm A")}
            </span>
            <span>
              Updated: {dayjs(record.updatedAt).format("DD MMM YYYY, h:mm A")}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="maint-modal-actions">
          <button onClick={onClose} className="maint-btn maint-btn-cancel">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceViewModal;
