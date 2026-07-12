import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPen, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import { getTripById, updateTrip } from "../../services/tripService";
import TripForm from "../../components/trip/TripForm";

function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setPageLoading(true);
        const res = await getTripById(id);
        setTrip(res.data.trip);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load trip");
        navigate("/trips");
      } finally {
        setPageLoading(false);
      }
    };
    fetchTrip();
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    try {
      setIsLoading(true);
      await updateTrip(id, data);
      toast.success("Trip updated successfully");
      navigate(`/trips/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update trip");
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner
            className="text-blue-500 text-4xl"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <p className="text-slate-500 text-sm">Loading trip data...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/trips/${id}`)}
          className="p-2.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
        >
          <FaArrowLeft className="text-sm" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Trip</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {trip?.source} → {trip?.destination}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <FaPen className="text-amber-500 text-sm" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Update Trip Information
            </h2>
            <p className="text-xs text-slate-500">
              Modify the fields below and save your changes
            </p>
          </div>
        </div>

        <TripForm
          onSubmit={handleSubmit}
          defaultValues={trip}
          isEdit={true}
          isLoading={isLoading}
          onCancel={() => navigate(`/trips/${id}`)}
        />
      </div>
    </div>
  );
}

export default EditTrip;
