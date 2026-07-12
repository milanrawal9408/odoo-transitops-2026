import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

function DeleteConfirmModal({ isOpen, onClose, onConfirm, record }) {
  if (!isOpen || !record) return null;

  return (
    <div className="maint-modal-overlay" onClick={onClose}>
      <div
        className="maint-modal maint-modal-delete"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="maint-modal-header maint-modal-header-danger">
          <div className="maint-modal-header-title">
            <div className="maint-modal-header-icon maint-modal-header-icon-danger">
              <FaExclamationTriangle />
            </div>
            <div>
              <h2>Delete Maintenance Record</h2>
              <p>This action cannot be undone</p>
            </div>
          </div>
          <button className="maint-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="maint-delete-content">
          <p>
            Are you sure you want to delete this maintenance record? This will
            permanently remove the following record:
          </p>
          <div className="maint-delete-details">
            <div>
              <strong>Vehicle:</strong>{" "}
              {record.vehicle?.vehicleNumber || "N/A"}
            </div>
            <div>
              <strong>Type:</strong> {record.maintenanceType}
            </div>
            <div>
              <strong>Cost:</strong> ₹
              {(record.cost || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <p className="maint-delete-warning">
            If this vehicle is currently under maintenance, it will be set back
            to "Available".
          </p>
        </div>

        {/* Actions */}
        <div className="maint-modal-actions">
          <button onClick={onClose} className="maint-btn maint-btn-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="maint-btn maint-btn-danger">
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
