import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaTruck,
  FaUserTie,
  FaRoute,
  FaTools,
  FaPlus,
  FaCalendarAlt,
  FaArrowRight,
  FaSpinner,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { getVehicles } from "../../services/vehicleService";
import { getDrivers } from "../../services/driverService";
import { getTrips } from "../../services/tripService";
import { getAllMaintenances } from "../../services/maintenanceService";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
const TRIP_STATUS_COLORS = {
  Scheduled: "#3B82F6",
  "In Progress": "#F59E0B",
  Completed: "#10B981",
  Cancelled: "#EF4444",
};

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    vehicles: [],
    drivers: [],
    trips: [],
    maintenances: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, driversRes, tripsRes, maintenanceRes] = await Promise.all([
        getVehicles(),
        getDrivers(),
        getTrips(),
        getAllMaintenances(),
      ]);

      setData({
        vehicles: vehiclesRes.data.vehicles || [],
        drivers: driversRes.data.drivers || [],
        trips: tripsRes.data.trips || [],
        maintenances: maintenanceRes.data.maintenance || [],
      });
    } catch (error) {
      console.error("Dashboard load error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const { vehicles, drivers, trips, maintenances } = data;

  // Derived vehicle stats
  const totalVehicles = vehicles.length;
  const vehiclesAvailable = vehicles.filter((v) => v.status === "Available").length;
  const vehiclesOnTrip = vehicles.filter((v) => v.status === "On Trip").length;
  const vehiclesMaintenance = vehicles.filter((v) => v.status === "Maintenance").length;
  const vehiclesOutOfService = vehicles.filter((v) => v.status === "Out of Service").length;

  // Derived driver stats
  const totalDrivers = drivers.length;
  const driversAvailable = drivers.filter((d) => d.status === "Available").length;
  const driversOnTrip = drivers.filter((d) => d.status === "On Trip").length;
  const driversSuspended = drivers.filter((d) => d.status === "Suspended").length;

  // Derived trip stats
  const totalTrips = trips.length;
  const tripsInProgress = trips.filter((t) => t.status === "In Progress").length;
  const tripsScheduled = trips.filter((t) => t.status === "Scheduled").length;
  const tripsCompleted = trips.filter((t) => t.status === "Completed").length;

  // Derived maintenance stats
  const totalMaintenances = maintenances.length;
  const activeMaintenances = maintenances.filter((m) => m.status === "Scheduled" || m.status === "In Progress").length;

  // Pie chart data: Vehicle statuses
  const vehiclePieData = [
    { name: "Available", value: vehiclesAvailable },
    { name: "On Trip", value: vehiclesOnTrip },
    { name: "Maintenance", value: vehiclesMaintenance },
    { name: "Out of Service", value: vehiclesOutOfService },
  ].filter((item) => item.value > 0);

  // Fallback if vehicle data is empty
  const finalVehiclePieData = vehiclePieData.length
    ? vehiclePieData
    : [
        { name: "Available", value: 1 },
        { name: "On Trip", value: 0 },
        { name: "Maintenance", value: 0 },
        { name: "Out of Service", value: 0 },
      ];

  // Process last 7 days of trip activity for Area Chart
  const getTripTrends = () => {
    const dates = {};
    // Seed last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dates[dateStr] = 0;
    }

    // Populate from actual trips departureTime
    trips.forEach((trip) => {
      if (!trip.departureTime) return;
      const tripDate = new Date(trip.departureTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (dates[tripDate] !== undefined) {
        dates[tripDate]++;
      }
    });

    return Object.keys(dates).map((date) => ({
      date,
      Trips: dates[date],
    }));
  };

  const tripTrendData = getTripTrends();

  // Recent trips
  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B1120" }}>
        <div className="flex flex-col items-center gap-3">
          <FaSpinner
            className="text-indigo-500 text-4xl"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <p className="text-slate-400 text-sm font-medium">Loading fleet data...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0B1120", color: "#E2E8F0" }}>
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#F1F5F9" }}>
            Fleet Operations Dashboard
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "#64748B" }}>
            Real-time tracking, metrics, and logs for TransitOps ERP
          </p>
        </div>

        {/* Dynamic KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Vehicles */}
          <Link
            to="/vehicles"
            className="block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg border hover:shadow-blue-500/10"
            style={{
              background: "rgba(30,41,59,0.45)",
              borderColor: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.15)" }}
              >
                <FaTruck className="text-xl" style={{ color: "#3B82F6" }} />
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}>
                Fleet Size
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{totalVehicles}</h3>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#64748B" }}>Total Vehicles</p>
            <div className="flex gap-2 text-xs" style={{ color: "#94A3B8" }}>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{vehiclesAvailable} Avail</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{vehiclesOnTrip} Trip</span>
            </div>
          </Link>

          {/* Card 2: Drivers */}
          <Link
            to="/drivers"
            className="block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg border hover:shadow-violet-500/10"
            style={{
              background: "rgba(30,41,59,0.45)",
              borderColor: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.15)" }}
              >
                <FaUserTie className="text-xl" style={{ color: "#8B5CF6" }} />
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }}>
                Staff
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{totalDrivers}</h3>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#64748B" }}>Total Drivers</p>
            <div className="flex gap-2 text-xs" style={{ color: "#94A3B8" }}>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{driversAvailable} Avail</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>{driversOnTrip} Trip</span>
            </div>
          </Link>

          {/* Card 3: Trips */}
          <Link
            to="/trips"
            className="block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg border hover:shadow-emerald-500/10"
            style={{
              background: "rgba(30,41,59,0.45)",
              borderColor: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(16,185,129,0.15)" }}
              >
                <FaRoute className="text-xl" style={{ color: "#10B981" }} />
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                Active Trips
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{totalTrips}</h3>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#64748B" }}>Total Trips Logged</p>
            <div className="flex gap-2 text-xs" style={{ color: "#94A3B8" }}>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{tripsInProgress} Active</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{tripsScheduled} Sched</span>
            </div>
          </Link>

          {/* Card 4: Maintenance */}
          <Link
            to="/maintenance"
            className="block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg border hover:shadow-amber-500/10"
            style={{
              background: "rgba(30,41,59,0.45)",
              borderColor: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.15)" }}
              >
                <FaTools className="text-xl" style={{ color: "#F59E0B" }} />
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                Services
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{totalMaintenances}</h3>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#64748B" }}>Maintenance Log</p>
            <div className="flex gap-2 text-xs" style={{ color: "#94A3B8" }}>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{activeMaintenances} Pending</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>{totalMaintenances - activeMaintenances} Done</span>
            </div>
          </Link>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Trip Activity Line Chart */}
          <div
            className="lg:col-span-2 rounded-2xl p-6 border"
            style={{
              background: "rgba(30,41,59,0.3)",
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Trip Activity Trends</h3>
                <p className="text-xs" style={{ color: "#64748B" }}>Trips departed over the last 7 days</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                <FaCalendarAlt /> Last 7 Days
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tripTrendData}>
                  <defs>
                    <linearGradient id="tripGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#1E293B",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "#F1F5F9",
                    }}
                  />
                  <Area type="monotone" dataKey="Trips" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#tripGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vehicle Status Distribution Pie Chart */}
          <div
            className="rounded-2xl p-6 border flex flex-col justify-between"
            style={{
              background: "rgba(30,41,59,0.3)",
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Fleet Utilization</h3>
              <p className="text-xs mb-4" style={{ color: "#64748B" }}>Distribution of vehicle availability</p>
            </div>
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={finalVehiclePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {finalVehiclePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1E293B",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "#F1F5F9",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[0] }} /> Available: {vehiclesAvailable}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[1] }} /> On Trip: {vehiclesOnTrip}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[2] }} /> In Service: {vehiclesMaintenance}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[3] }} /> Out of Order: {vehiclesOutOfService}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Trips & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Trips Table */}
          <div
            className="lg:col-span-2 rounded-2xl p-6 border overflow-hidden"
            style={{
              background: "rgba(30,41,59,0.3)",
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Recent Trips</h3>
                <p className="text-xs" style={{ color: "#64748B" }}>Latest logged journeys in the system</p>
              </div>
              <Link
                to="/trips"
                className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 hover:underline"
              >
                View All Trips <FaArrowRight className="text-[10px]" />
              </Link>
            </div>

            {recentTrips.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No trips logged in the system yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#64748B" }}>
                      <th className="pb-3 font-semibold uppercase tracking-wider">Route</th>
                      <th className="pb-3 font-semibold uppercase tracking-wider">Driver</th>
                      <th className="pb-3 font-semibold uppercase tracking-wider">Vehicle</th>
                      <th className="pb-3 font-semibold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip) => (
                      <tr
                        key={trip._id}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        className="hover:bg-slate-800/20 transition-all"
                      >
                        <td className="py-3.5 font-semibold text-white">
                          <Link to={`/trips/${trip._id}`} className="hover:text-indigo-400 hover:underline">
                            {trip.source} → {trip.destination}
                          </Link>
                        </td>
                        <td className="py-3.5 text-slate-300">
                          {trip.driver?.fullName || "Unassigned"}
                        </td>
                        <td className="py-3.5 text-slate-300">
                          {trip.vehicle?.vehicleNumber || "—"}
                        </td>
                        <td className="py-3.5">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              background: `${TRIP_STATUS_COLORS[trip.status] || "#64748B"}22`,
                              color: TRIP_STATUS_COLORS[trip.status] || "#E2E8F0",
                            }}
                          >
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div
            className="rounded-2xl p-6 border flex flex-col"
            style={{
              background: "rgba(30,41,59,0.3)",
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="text-lg font-bold text-white mb-1">Quick Actions</h3>
            <p className="text-xs mb-5" style={{ color: "#64748B" }}>Common shortcuts for management tasks</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/trips/add"
                className="flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold text-white transition-all bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
              >
                <span className="flex items-center gap-3">
                  <FaRoute /> Create New Trip
                </span>
                <FaPlus className="text-xs" />
              </Link>

              <Link
                to="/vehicles"
                className="flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white transition-all border border-slate-700 hover:border-slate-500 hover:bg-slate-800/30"
              >
                <span className="flex items-center gap-3">
                  <FaTruck className="text-slate-400" /> Register Vehicle
                </span>
                <FaPlus className="text-xs text-slate-400" />
              </Link>

              <Link
                to="/drivers"
                className="flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white transition-all border border-slate-700 hover:border-slate-500 hover:bg-slate-800/30"
              >
                <span className="flex items-center gap-3">
                  <FaUserTie className="text-slate-400" /> Add Driver Profile
                </span>
                <FaPlus className="text-xs text-slate-400" />
              </Link>

              <Link
                to="/maintenance"
                className="flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white transition-all border border-slate-700 hover:border-slate-500 hover:bg-slate-800/30"
              >
                <span className="flex items-center gap-3">
                  <FaTools className="text-slate-400" /> Request Maintenance
                </span>
                <FaPlus className="text-xs text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;