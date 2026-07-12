import { FaSearch, FaTimes } from "react-icons/fa";

function MaintenanceFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
}) {
  const maintenanceTypes = [
    "Oil Change",
    "Tire Replacement",
    "Engine Repair",
    "Brake Service",
    "Battery Replacement",
    "AC Service",
    "General Service",
    "Other",
  ];

  const hasFilters = searchTerm || statusFilter || typeFilter;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setTypeFilter("");
  };

  return (
    <div className="maint-filters">
      <div className="maint-filter-search">
        <FaSearch className="maint-filter-search-icon" />
        <input
          id="maintenance-search"
          type="text"
          placeholder="Search by vehicle, technician, type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="maint-filter-input"
        />
      </div>

      <select
        id="maintenance-status-filter"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="maint-filter-select"
      >
        <option value="">All Status</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <select
        id="maintenance-type-filter"
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className="maint-filter-select"
      >
        <option value="">All Types</option>
        {maintenanceTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          id="maintenance-clear-filters"
          onClick={clearFilters}
          className="maint-filter-clear-btn"
        >
          <FaTimes />
          Clear
        </button>
      )}
    </div>
  );
}

export default MaintenanceFilters;
