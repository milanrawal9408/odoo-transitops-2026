import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import { createTrip } from "../../services/tripService";
import TripForm from "../../components/trip/TripForm";

function AddTrip() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setIsLoading(true);
      await createTrip(data);
      toast.success("Trip created successfully");
      navigate("/trips");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create trip");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/trips")}
          className="p-2.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
        >
          <FaArrowLeft className="text-sm" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create New Trip</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Fill in the details to schedule a new trip
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FaPlus className="text-blue-500 text-sm" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Trip Information</h2>
            <p className="text-xs text-slate-500">
              Fields marked with <span className="text-red-400">*</span> are required
            </p>
          </div>
        </div>

        <TripForm
          onSubmit={handleSubmit}
          isEdit={false}
          isLoading={isLoading}
          onCancel={() => navigate("/trips")}
        />
      </div>
    </div>
  );
}

export default AddTrip;
