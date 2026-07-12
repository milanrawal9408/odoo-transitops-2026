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
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 w-full">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          id="maintenance-search"
          type="text"
          placeholder="Search by registration number, technician, type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
        />
      </div>

      {/* Status Filter */}
      <select
        id="maintenance-status-filter"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full sm:w-auto px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-600 transition-all cursor-pointer"
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      {/* Type Filter */}
      <select
        id="maintenance-type-filter"
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className="w-full sm:w-auto px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-600 transition-all cursor-pointer"
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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
        >
          <FaTimes />
          Clear
        </button>
      )}
    </div>
  );
}

export default MaintenanceFilters;
