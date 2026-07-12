import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPen,
  FaTrash,
  FaRoute,
  FaTruck,
  FaUserTie,
  FaClock,
  FaMapMarkerAlt,
  FaWeight,
  FaSpinner,
  FaStickyNote,
  FaCalendarAlt,
  FaArrowRight,
  FaPlay,
  FaCheckCircle,
  FaBan,
  FaInfoCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { getTripById, deleteTrip } from "../../services/tripService";
import DeleteModal from "../../components/common/DeleteModal";

function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const res = await getTripById(id);
        setTrip(res.data.trip);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load trip");
        navigate("/trips");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteTrip(id);
      toast.success("Trip deleted successfully");
      navigate("/trips");
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
        icon: <FaClock className="text-sm" />,
        gradient: "from-blue-500 to-blue-600",
      },
      "In Progress": {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <FaPlay className="text-sm" />,
        gradient: "from-amber-500 to-amber-600",
      },
      Completed: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: <FaCheckCircle className="text-sm" />,
        gradient: "from-emerald-500 to-emerald-600",
      },
      Cancelled: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: <FaBan className="text-sm" />,
        gradient: "from-red-500 to-red-600",
      },
    };
    return configs[status] || configs.Scheduled;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner
            className="text-blue-500 text-4xl"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <p className="text-slate-500 text-sm">Loading trip details...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!trip) return null;

  const statusConfig = getStatusConfig(trip.status);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/trips")}
            className="p-2.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Trip Details</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {trip.source} → {trip.destination}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/trips/${id}/edit`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/25"
          >
            <FaPen className="text-xs" />
            Edit
          </button>
          <button
            onClick={() => setDeleteModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all duration-200 cursor-pointer"
          >
            <FaTrash className="text-xs" />
            Delete
          </button>
        </div>
      </div>

      {/* Route & Status Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className={`bg-gradient-to-r ${statusConfig.gradient} p-6 text-white`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FaRoute className="text-xl" />
              </div>
              <div>
                <div className="flex items-center gap-3 text-xl font-bold">
                  <span>{trip.source}</span>
                  <FaArrowRight className="text-sm text-white/70" />
                  <span>{trip.destination}</span>
                </div>
                <p className="text-sm text-white/80 mt-0.5">
                  {trip.distance} km • Departed{" "}
                  {dayjs(trip.departureTime).format("DD MMM YYYY, hh:mm A")}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              {statusConfig.icon}
              {trip.status}
            </span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Vehicle Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <FaTruck className="text-blue-500 text-sm" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Vehicle Details</h3>
          </div>
          <div className="space-y-3">
            <InfoRow
              label="Vehicle Number"
              value={trip.vehicle?.vehicleNumber || "N/A"}
            />
            <InfoRow
              label="Type"
              value={trip.vehicle?.vehicleType || "N/A"}
            />
            <InfoRow
              label="Manufacturer"
              value={
                trip.vehicle
                  ? `${trip.vehicle.manufacturer} ${trip.vehicle.model}`
                  : "N/A"
              }
            />
            <InfoRow
              label="Fuel Type"
              value={trip.vehicle?.fuelType || "N/A"}
            />
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <FaUserTie className="text-emerald-500 text-sm" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Driver Details</h3>
          </div>
          <div className="space-y-3">
            <InfoRow
              label="Driver Name"
              value={trip.driver?.fullName || "N/A"}
            />
            <InfoRow
              label="Email"
              value={trip.driver?.email || "N/A"}
            />
          </div>
        </div>

        {/* Schedule Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <FaCalendarAlt className="text-amber-500 text-sm" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Schedule</h3>
          </div>
          <div className="space-y-3">
            <InfoRow
              label="Departure"
              value={
                trip.departureTime
                  ? dayjs(trip.departureTime).format("DD MMM YYYY, hh:mm A")
                  : "—"
              }
            />
            <InfoRow
              label="Arrival"
              value={
                trip.arrivalTime
                  ? dayjs(trip.arrivalTime).format("DD MMM YYYY, hh:mm A")
                  : "Not set"
              }
            />
            <InfoRow
              label="Duration"
              value={
                trip.departureTime && trip.arrivalTime
                  ? (() => {
                      const hours = dayjs(trip.arrivalTime).diff(
                        dayjs(trip.departureTime),
                        "hour"
                      );
                      const mins =
                        dayjs(trip.arrivalTime).diff(
                          dayjs(trip.departureTime),
                          "minute"
                        ) % 60;
                      return `${hours}h ${mins}m`;
                    })()
                  : "—"
              }
            />
          </div>
        </div>

        {/* Cargo & Route Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
              <FaMapMarkerAlt className="text-purple-500 text-sm" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Route & Cargo
            </h3>
          </div>
          <div className="space-y-3">
            <InfoRow label="Source" value={trip.source} />
            <InfoRow label="Destination" value={trip.destination} />
            <InfoRow label="Distance" value={`${trip.distance} km`} />
            <InfoRow
              label="Cargo Weight"
              value={trip.cargoWeight ? `${trip.cargoWeight} kg` : "No cargo"}
            />
          </div>
        </div>
      </div>

      {/* Remarks */}
      {trip.remarks && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
              <FaStickyNote className="text-slate-500 text-sm" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Remarks</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">
            {trip.remarks}
          </p>
        </div>
      )}

      {/* Meta Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
            <FaInfoCircle className="text-slate-500 text-sm" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Record Information
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoRow
            label="Created By"
            value={trip.createdBy?.fullName || "N/A"}
          />
          <InfoRow
            label="Created At"
            value={dayjs(trip.createdAt).format("DD MMM YYYY, hh:mm A")}
          />
          <InfoRow
            label="Last Updated"
            value={dayjs(trip.updatedAt).format("DD MMM YYYY, hh:mm A")}
          />
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Trip"
        message={`Are you sure you want to delete the trip "${trip.source} → ${trip.destination}"? This action cannot be undone.`}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Reusable info row component
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800 text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

export default TripDetail;
