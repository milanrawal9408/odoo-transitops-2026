import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaRoute,
  FaClock,
  FaCheckCircle,
  FaBan,
  FaTruck,
  FaSearch,
  FaSpinner,
  FaEye,
  FaPen,
  FaTrash,
  FaArrowRight,
  FaPlay,
} from "react-icons/fa";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { getTrips, deleteTrip } from "../../services/tripService";
import DeleteModal from "../../components/common/DeleteModal";

function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    tripId: null,
    tripName: "",
  });
  const [deleting, setDeleting] = useState(false);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await getTrips();
      setTrips(res.data.trips || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = trips.length;
    const scheduled = trips.filter((t) => t.status === "Scheduled").length;
    const inProgress = trips.filter((t) => t.status === "In Progress").length;
    const completed = trips.filter((t) => t.status === "Completed").length;
    const cancelled = trips.filter((t) => t.status === "Cancelled").length;
    return { total, scheduled, inProgress, completed, cancelled };
  }, [trips]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
    let result = trips;

    if (statusFilter !== "All") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.source?.toLowerCase().includes(q) ||
          t.destination?.toLowerCase().includes(q) ||
          t.vehicle?.vehicleNumber?.toLowerCase().includes(q) ||
          t.driver?.fullName?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [trips, statusFilter, searchQuery]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteTrip(deleteModal.tripId);
      toast.success("Trip deleted successfully");
      setDeleteModal({ isOpen: false, tripId: null, tripName: "" });
      fetchTrips();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete trip");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      Scheduled: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: <FaClock className="text-xs" />,
      },
      "In Progress": {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <FaPlay className="text-xs" />,
      },
      Completed: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: <FaCheckCircle className="text-xs" />,
      },
      Cancelled: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: <FaBan className="text-xs" />,
      },
    };
    return configs[status] || configs.Scheduled;
  };

  const statCards = [
    {
      label: "Total Trips",
      value: stats.total,
      icon: <FaRoute />,
      gradient: "from-slate-600 to-slate-800",
      shadow: "shadow-slate-500/25",
    },
    {
      label: "Scheduled",
      value: stats.scheduled,
      icon: <FaClock />,
      gradient: "from-blue-500 to-blue-700",
      shadow: "shadow-blue-500/25",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: <FaPlay />,
      gradient: "from-amber-500 to-amber-700",
      shadow: "shadow-amber-500/25",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: <FaCheckCircle />,
      gradient: "from-emerald-500 to-emerald-700",
      shadow: "shadow-emerald-500/25",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trip Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and monitor all fleet trips
          </p>
        </div>
        <button
          onClick={() => navigate("/trips/add")}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          <FaPlus className="text-xs" />
          New Trip
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.gradient} text-white rounded-2xl p-5 shadow-lg ${card.shadow} transition-transform duration-200 hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <div className="text-2xl text-white/40">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by route, vehicle, or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {["All", "Scheduled", "In Progress", "Completed", "Cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer border ${
                  statusFilter === status
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <FaSpinner
                className="text-blue-500 text-3xl"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              <p className="text-slate-500 text-sm">Loading trips...</p>
            </div>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FaRoute className="text-5xl mb-4 text-slate-300" />
            <p className="text-lg font-semibold text-slate-500">No trips found</p>
            <p className="text-sm mt-1">
              {trips.length === 0
                ? 'Click "New Trip" to create your first trip'
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Departure
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTrips.map((trip) => {
                  const statusConfig = getStatusConfig(trip.status);
                  return (
                    <tr
                      key={trip._id}
                      className="hover:bg-blue-50/40 transition-colors duration-150 cursor-pointer group"
                      onClick={() => navigate(`/trips/${trip._id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <span>{trip.source}</span>
                          <FaArrowRight className="text-xs text-slate-400" />
                          <span>{trip.destination}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FaTruck className="text-xs text-slate-400" />
                          {trip.vehicle?.vehicleNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {trip.driver?.fullName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {trip.departureTime
                          ? dayjs(trip.departureTime).format("DD MMM YYYY, hh:mm A")
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {trip.distance} km
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          {statusConfig.icon}
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trips/${trip._id}`);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150 cursor-pointer"
                            title="View"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trips/${trip._id}/edit`);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-150 cursor-pointer"
                            title="Edit"
                          >
                            <FaPen className="text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({
                                isOpen: true,
                                tripId: trip._id,
                                tripName: `${trip.source} → ${trip.destination}`,
                              });
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 cursor-pointer"
                            title="Delete"
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
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, tripId: null, tripName: "" })
        }
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Trip"
        message={`Are you sure you want to delete the trip "${deleteModal.tripName}"? This action cannot be undone.`}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Trips;