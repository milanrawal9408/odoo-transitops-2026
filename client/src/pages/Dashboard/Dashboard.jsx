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
} from "recharts";

import { getVehicles } from "../../services/vehicleService";
import { getDrivers } from "../../services/driverService";
import { getTrips } from "../../services/tripService";
import { getAllMaintenances } from "../../services/maintenanceService";

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
const TRIP_STATUS_COLORS = {
  Scheduled: "#3B82F6",
  "In Progress": "#F59E0B",
  Completed: "#10B981",
  Cancelled: "#EF4444",
};

const TRIP_STATUS_CLASSES = {
  Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
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
        maintenances: maintenanceRes.data.maintenances || maintenanceRes.data.maintenance || [],
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

  // Derived trip stats
  const totalTrips = trips.length;
  const tripsInProgress = trips.filter((t) => t.status === "In Progress").length;
  const tripsScheduled = trips.filter((t) => t.status === "Scheduled").length;

  // Derived maintenance stats
  const totalMaintenances = maintenances.length;
  const activeMaintenances = maintenances.filter((m) => m.status === "Pending" || m.status === "In Progress").length;

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner
            className="text-blue-500 text-4xl"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <p className="text-slate-500 text-sm font-medium">Loading fleet data...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Fleet Operations Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time tracking, metrics, and logs for TransitOps ERP
        </p>
      </div>

      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vehicles */}
        <Link
          to="/vehicles"
          className="bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-2xl p-5 shadow-lg shadow-slate-500/10 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total Vehicles</p>
              <p className="text-3xl font-bold mt-1">{totalVehicles}</p>
            </div>
            <div className="text-2xl text-white/40"><FaTruck /></div>
          </div>
          <div className="flex gap-2 text-xs text-white/70 mt-3 border-t border-white/10 pt-2">
            <span>{vehiclesAvailable} Avail</span>
            <span>•</span>
            <span>{vehiclesOnTrip} Active</span>
          </div>
        </Link>

        {/* Drivers */}
        <Link
          to="/drivers"
          className="bg-gradient-to-br from-violet-500 to-violet-700 text-white rounded-2xl p-5 shadow-lg shadow-violet-500/10 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total Drivers</p>
              <p className="text-3xl font-bold mt-1">{totalDrivers}</p>
            </div>
            <div className="text-2xl text-white/40"><FaUserTie /></div>
          </div>
          <div className="flex gap-2 text-xs text-white/70 mt-3 border-t border-white/10 pt-2">
            <span>{driversAvailable} Avail</span>
            <span>•</span>
            <span>{driversOnTrip} Active</span>
          </div>
        </Link>

        {/* Trips */}
        <Link
          to="/trips"
          className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl p-5 shadow-lg shadow-emerald-500/10 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total Trips</p>
              <p className="text-3xl font-bold mt-1">{totalTrips}</p>
            </div>
            <div className="text-2xl text-white/40"><FaRoute /></div>
          </div>
          <div className="flex gap-2 text-xs text-white/70 mt-3 border-t border-white/10 pt-2">
            <span>{tripsInProgress} Running</span>
            <span>•</span>
            <span>{tripsScheduled} Sched</span>
          </div>
        </Link>

        {/* Maintenance */}
        <Link
          to="/maintenance"
          className="bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-2xl p-5 shadow-lg shadow-amber-500/10 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Maintenance Log</p>
              <p className="text-3xl font-bold mt-1">{totalMaintenances}</p>
            </div>
            <div className="text-2xl text-white/40"><FaTools /></div>
          </div>
          <div className="flex gap-2 text-xs text-white/70 mt-3 border-t border-white/10 pt-2">
            <span>{activeMaintenances} Pending</span>
            <span>•</span>
            <span>{totalMaintenances - activeMaintenances} Done</span>
          </div>
        </Link>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip Activity Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Trip Activity Trends</h3>
              <p className="text-xs text-slate-400 mt-0.5">Trips departed over the last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              <FaCalendarAlt /> Last 7 Days
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tripTrendData}>
                <defs>
                  <linearGradient id="tripGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    color: "#1E293B",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area type="monotone" dataKey="Trips" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#tripGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Status Distribution Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Fleet Utilization</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution of vehicle availability</p>
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
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    color: "#1E293B",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[0] }} /> Available: {vehiclesAvailable}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[1] }} /> On Trip: {vehiclesOnTrip}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[2] }} /> In Service: {vehiclesMaintenance}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[3] }} /> Out of Order: {vehiclesOutOfService}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Trips & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Recent Trips</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest logged journeys in the system</p>
            </div>
            <Link
              to="/trips"
              className="text-xs font-semibold text-blue-600 flex items-center gap-1.5 hover:underline"
            >
              View All Trips <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No trips logged in the system yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold text-left">Route</th>
                    <th className="pb-3 font-semibold text-left">Driver</th>
                    <th className="pb-3 font-semibold text-left">Vehicle</th>
                    <th className="pb-3 font-semibold text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentTrips.map((trip) => (
                    <tr
                      key={trip._id}
                      className="hover:bg-blue-50/40 transition-colors duration-150"
                    >
                      <td className="py-3 text-sm font-semibold text-slate-800">
                        <Link to={`/trips/${trip._id}`} className="hover:text-blue-600 hover:underline">
                          {trip.source} → {trip.destination}
                        </Link>
                      </td>
                      <td className="py-3 text-slate-600 text-sm">
                        {trip.driver?.fullName || "Unassigned"}
                      </td>
                      <td className="py-3 text-slate-600 text-sm">
                        {trip.vehicle?.vehicleNumber || "—"}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${TRIP_STATUS_CLASSES[trip.status] || "bg-slate-50 text-slate-700"}`}>
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
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Common shortcuts for fleet management tasks</p>
          </div>
          <div className="flex flex-col gap-3 mt-5">
            <Link
              to="/trips/add"
              className="flex items-center justify-between p-3 px-4 rounded-xl text-sm font-semibold text-white transition-all bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
            >
              <span className="flex items-center gap-3">
                <FaRoute /> Create New Trip
              </span>
              <FaPlus className="text-xs" />
            </Link>

            <Link
              to="/vehicles"
              className="flex items-center justify-between p-3 px-4 rounded-xl text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all border border-slate-200 hover:border-blue-200 bg-white hover:bg-blue-50/20"
            >
              <span className="flex items-center gap-3">
                <FaTruck className="text-slate-400" /> Register Vehicle
              </span>
              <FaPlus className="text-xs text-slate-400" />
            </Link>

            <Link
              to="/drivers"
              className="flex items-center justify-between p-3 px-4 rounded-xl text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all border border-slate-200 hover:border-blue-200 bg-white hover:bg-blue-50/20"
            >
              <span className="flex items-center gap-3">
                <FaUserTie className="text-slate-400" /> Add Driver Profile
              </span>
              <FaPlus className="text-xs text-slate-400" />
            </Link>

            <Link
              to="/maintenance"
              className="flex items-center justify-between p-3 px-4 rounded-xl text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all border border-slate-200 hover:border-blue-200 bg-white hover:bg-blue-50/20"
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
  );
}

export default Dashboard;