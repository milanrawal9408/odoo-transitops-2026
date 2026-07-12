import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDrivers } from "../../services/driverService";
import { FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaIdCard, FaClock, FaTruck, FaSpinner } from "react-icons/fa";

function Profile() {
  const { user } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === "Driver") {
      fetchDriverProfile();
    }
  }, [user]);

  const fetchDriverProfile = async () => {
    try {
      setLoading(true);
      const res = await getDrivers();
      const profiles = res.data.drivers || [];
      const match = profiles.find((p) => p.user?._id === user._id || p.user === user._id);
      if (match) {
        setDriverProfile(match);
      }
    } catch (err) {
      console.warn("Could not load additional driver profile details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">View your profile details and credential authorizations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl mb-4 shadow-inner">
            {user.fullName ? user.fullName[0].toUpperCase() : "U"}
          </div>
          <h2 className="text-lg font-bold text-slate-800">{user.fullName}</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
            <FaShieldAlt className="text-[10px]" /> {user.role}
          </span>
          <p className="text-xs text-slate-400 mt-3">Account Status: Active</p>
        </div>

        {/* Details Card */}
        <div className="md:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50 flex items-center gap-2">
              <FaUser className="text-blue-500" /> Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Full Name</span>
                <span className="text-sm font-semibold text-slate-700">{user.fullName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email Address</span>
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FaEnvelope className="text-slate-300" /> {user.email}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FaPhone className="text-slate-300" /> {user.phone || "—"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">System Role</span>
                <span className="text-sm font-semibold text-slate-700">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Driver Profile Details (Drivers only) */}
          {user.role === "Driver" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm relative min-h-[150px]">
              <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50 flex items-center gap-2">
                <FaIdCard className="text-blue-500" /> License & Fleet Assignment
              </h3>
              {loading ? (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
                  <FaSpinner className="animate-spin text-blue-500 text-xl" />
                </div>
              ) : driverProfile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">License Number</span>
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <FaIdCard className="text-slate-300" /> {driverProfile.licenseNumber}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">License Expiry</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {driverProfile.licenseExpiry ? new Date(driverProfile.licenseExpiry).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Experience</span>
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <FaClock className="text-slate-300" /> {driverProfile.experience} years
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Assigned Vehicle</span>
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <FaTruck className="text-slate-300" />{" "}
                      {driverProfile.assignedVehicle?.vehicleNumber || "No vehicle assigned"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-6">No additional driver profile parameters found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
