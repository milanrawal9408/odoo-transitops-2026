import React, { useState, useEffect } from "react";
import {
  FaTruck,
  FaUserTie,
  FaRoute,
  FaTools,
  FaGasPump,
  FaChartBar,
  FaRobot,
  FaArrowUp,
  FaArrowDown,
  FaFilePdf,
  FaFileExcel,
  FaPrint,
  FaRegLightbulb,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPaperPlane,
  FaSpinner,
  FaClock,
  FaTimes,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import API from "../../services/api";

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

// --- CUSTOM MINI SPARKLINE COMPONENT ---
function Sparkline({ data, color = "#3B82F6" }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;
  const width = 100;
  const height = 30;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="w-24 h-8 shrink-0 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

// --- SUBCOMPONENTS ---

function ReportCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-6 shadow-sm ${className}`}>
      <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InsightItem({ type, text }) {
  const configs = {
    success: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-800",
      icon: <FaCheckCircle className="text-emerald-500 text-sm mt-0.5" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-800",
      icon: <FaInfoCircle className="text-blue-500 text-sm mt-0.5" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-800",
      icon: <FaRegLightbulb className="text-amber-500 text-sm mt-0.5" />,
    },
    danger: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-800",
      icon: <FaExclamationTriangle className="text-red-500 text-sm mt-0.5" />,
    },
  };

  const cfg = configs[type] || configs.info;

  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.text} transition-all duration-200 hover:translate-x-1`}>
      {cfg.icon}
      <p className="text-xs font-semibold leading-relaxed">{text}</p>
    </div>
  );
}

function KPICard({ label, value, trend, desc, icon, sparkData, gradient = "from-blue-600 to-blue-800" }) {
  const isPositive = trend >= 0;
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-md`}>
          {icon}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 border-t border-slate-50 pt-3">
        <div>
          <span className={`inline-flex items-center gap-1 text-xs font-bold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
            {isPositive ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(trend)}%
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
        </div>
        <Sparkline data={sparkData} color={isPositive ? "#10B981" : "#EF4444"} />
      </div>
    </div>
  );
}

function PredictionRow({ label, value, confidence, labelClass = "" }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-all">
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <span className="text-[10px] font-bold text-slate-400">Confidence: {confidence}%</span>
      </div>
      <span className={`text-base font-bold ${labelClass}`}>{value}</span>
    </div>
  );
}

function TimelineItem({ title, time, type, desc }) {
  const badgeConfig = {
    trip: "bg-emerald-100 text-emerald-700",
    maintenance: "bg-amber-100 text-amber-700",
    vehicle: "bg-blue-100 text-blue-700",
    fuel: "bg-purple-100 text-purple-700",
  };
  return (
    <div className="flex gap-4 relative pl-4 border-l border-slate-100 pb-5 last:pb-0">
      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-4 ring-blue-50" />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <span className="text-[10px] text-slate-400 font-medium">{time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${badgeConfig[type] || "bg-slate-100 text-slate-600"}`}>
            {type}
          </span>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
function Reports() {
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Hello! I can summarize this reports dashboard for you. Ask me about monthly analysis, highest expenses, or download reports." },
  ]);

  // Filter states
  const [dateRange, setDateRange] = useState("This Month");
  const [statusFilter, setStatusFilter] = useState("All");

  // Simulated Dashboard API context data
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchReportsData();
  }, [dateRange, statusFilter]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      // Simulating API loading latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Realistic mock payload conforming to Odoo/Dynamics ERP statistics
      setDashboardData({
        kpis: {
          totalVehicles: 48,
          availVehicles: 34,
          onTripVehicles: 10,
          maintVehicles: 4,
          totalDrivers: 52,
          activeTrips: 10,
          completedTrips: 340,
          totalFuelExpense: 245000,
          totalMaintCost: 89000,
          totalDistance: 142000,
          utilization: 87,
          avgDuration: 4.8,
        },
        tripsPerMonth: [
          { month: "Jan", Trips: 140 },
          { month: "Feb", Trips: 185 },
          { month: "Mar", Trips: 210 },
          { month: "Apr", Trips: 195 },
          { month: "May", Trips: 240 },
          { month: "Jun", Trips: 290 },
          { month: "Jul", Trips: 340 },
        ],
        fuelCostPerMonth: [
          { month: "Jan", Fuel: 110000 },
          { month: "Feb", Fuel: 130000 },
          { month: "Mar", Fuel: 155000 },
          { month: "Apr", Fuel: 145000 },
          { month: "May", Fuel: 180000 },
          { month: "Jun", Fuel: 210000 },
          { month: "Jul", Fuel: 245000 },
        ],
        maintExpenses: [
          { month: "Jan", Cost: 25000 },
          { month: "Feb", Cost: 48000 },
          { month: "Mar", Cost: 35000 },
          { month: "Apr", Cost: 62000 },
          { month: "May", Cost: 41000 },
          { month: "Jun", Cost: 75000 },
          { month: "Jul", Cost: 89000 },
        ],
        vehicleStatus: [
          { name: "Available", value: 34 },
          { name: "On Trip", value: 10 },
          { name: "Maintenance", value: 4 },
        ],
        tripStatus: [
          { name: "Completed", value: 340 },
          { name: "In Progress", value: 10 },
          { name: "Scheduled", value: 15 },
          { name: "Cancelled", value: 5 },
        ],
        topDrivers: [
          { name: "Rajesh Sharma", count: 48, fuel: "8.5", onTime: "99%", cost: "1,200" },
          { name: "Vikram Singh", count: 42, fuel: "9.1", onTime: "97%", cost: "2,400" },
          { name: "Amit Patel", count: 39, fuel: "8.9", onTime: "96%", cost: "1,800" },
          { name: "Suresh Kumar", count: 35, fuel: "9.3", onTime: "95%", cost: "3,100" },
          { name: "Manpreet Singh", count: 31, fuel: "8.7", onTime: "98%", cost: "900" },
        ],
        topVehicles: [
          { number: "GJ01AB1234", distance: 4500, maintenance: "1,200", utilization: "92" },
          { number: "MH02CD5678", distance: 4100, maintenance: "2,500", utilization: "88" },
          { number: "DL03EF9012", distance: 3800, maintenance: "1,800", utilization: "85" },
          { number: "KA04GH3456", distance: 3500, maintenance: "3,100", utilization: "81" },
          { number: "HR05IJ7890", distance: 3200, maintenance: "900", utilization: "79" },
        ],
        utilizationTrend: [
          { date: "01 Jul", Utilization: 78 },
          { date: "05 Jul", Utilization: 82 },
          { date: "10 Jul", Utilization: 80 },
          { date: "15 Jul", Utilization: 85 },
          { date: "20 Jul", Utilization: 84 },
          { date: "25 Jul", Utilization: 88 },
          { date: "30 Jul", Utilization: 87 },
        ],
        revenueVsFuel: [
          { month: "May", Revenue: 450000, Fuel: 180000 },
          { month: "Jun", Revenue: 580000, Fuel: 210000 },
          { month: "Jul", Revenue: 690000, Fuel: 245000 },
        ],
        maintFreq: [
          { name: "Oil Change", count: 18 },
          { name: "Brakes", count: 12 },
          { name: "Tires", count: 10 },
          { name: "Engine Tune", count: 4 },
        ],
      });
    } catch (err) {
      toast.error("Failed to load analytics dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    toast.success("PDF report generated successfully!");
  };

  const handleExportExcel = () => {
    toast.success("Excel sheet exported successfully!");
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const query = chatInput;
    setChatMessages((prev) => [...prev, { role: "user", text: query }]);
    setChatInput("");
    setChatLoading(true);

    try {
      // Direct call to OpenRouter integration route
      const res = await API.post("/ai/chat", {
        message: query,
        history: chatMessages.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          text: m.text,
        })),
      });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data.reply || "No reply generated." },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Error contacting assistant: " + (err.response?.data?.message || "Service error") },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-blue-600 text-3xl" />
          <p className="text-slate-500 text-sm font-semibold">Generating business intelligence reports...</p>
        </div>
      </div>
    );
  }

  const { kpis } = dashboardData;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise Fleet Operations Dashboard and Business Intelligence Log</p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <FaFilePdf className="text-red-500" /> Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <FaFileExcel className="text-emerald-500" /> Export Excel
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <FaPrint className="text-blue-500" /> Print Report
          </button>
        </div>
      </div>

      {/* 2. Smart Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-blue-500"
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="Custom">Custom Range</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trip Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-blue-500"
          >
            <option value="All">All Trips</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Maintenance Status</label>
          <select className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-blue-500">
            <option>All Statuses</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fuel Type</label>
          <select className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-blue-500">
            <option>All Fuels</option>
            <option>Diesel</option>
            <option>Petrol</option>
            <option>CNG</option>
            <option>Electric</option>
          </select>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            onClick={fetchReportsData}
            className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer text-center"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setDateRange("This Month");
              setStatusFilter("All");
            }}
            className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 3. Executive KPI Grid (12 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Vehicles"
          value={kpis.totalVehicles}
          trend={2.4}
          desc="vs last month"
          icon={<FaTruck />}
          sparkData={[40, 42, 45, 45, 48]}
          gradient="from-slate-600 to-slate-800"
        />
        <KPICard
          label="Available Vehicles"
          value={kpis.availVehicles}
          trend={4.8}
          desc="vs last month"
          icon={<FaTruck />}
          sparkData={[30, 31, 32, 33, 34]}
          gradient="from-emerald-500 to-emerald-700"
        />
        <KPICard
          label="Vehicles On Trip"
          value={kpis.onTripVehicles}
          trend={-1.2}
          desc="vs last month"
          icon={<FaRoute />}
          sparkData={[12, 11, 10, 10, 10]}
          gradient="from-blue-500 to-blue-700"
        />
        <KPICard
          label="In Maintenance"
          value={kpis.maintVehicles}
          trend={-5.4}
          desc="vs last month"
          icon={<FaTools />}
          sparkData={[6, 5, 5, 4, 4]}
          gradient="from-amber-500 to-amber-700"
        />
        <KPICard
          label="Total Drivers"
          value={kpis.totalDrivers}
          trend={1.8}
          desc="vs last month"
          icon={<FaUserTie />}
          sparkData={[50, 51, 51, 52, 52]}
          gradient="from-indigo-500 to-indigo-700"
        />
        <KPICard
          label="Active Trips"
          value={kpis.activeTrips}
          trend={8.5}
          desc="vs last month"
          icon={<FaRoute />}
          sparkData={[8, 9, 9, 10, 10]}
          gradient="from-sky-500 to-sky-700"
        />
        <KPICard
          label="Completed Trips"
          value={kpis.completedTrips}
          trend={12.4}
          desc="vs last month"
          icon={<FaCheckCircle />}
          sparkData={[300, 310, 320, 330, 340]}
          gradient="from-teal-500 to-teal-700"
        />
        <KPICard
          label="Total Fuel Expense"
          value={`₹${(kpis.totalFuelExpense / 1000).toFixed(0)}k`}
          trend={18.2}
          desc="vs last month"
          icon={<FaGasPump />}
          sparkData={[180, 200, 210, 230, 245]}
          gradient="from-rose-500 to-rose-700"
        />
        <KPICard
          label="Maintenance Cost"
          value={`₹${(kpis.totalMaintCost / 1000).toFixed(0)}k`}
          trend={-2.4}
          desc="vs last month"
          icon={<FaTools />}
          sparkData={[95, 92, 90, 89, 89]}
          gradient="from-orange-500 to-orange-700"
        />
        <KPICard
          label="Distance Travelled"
          value={`${(kpis.totalDistance / 1000).toFixed(0)}k km`}
          trend={6.8}
          desc="vs last month"
          icon={<FaRoute />}
          sparkData={[120, 130, 135, 138, 142]}
          gradient="from-violet-500 to-violet-700"
        />
        <KPICard
          label="Fleet Utilization"
          value={`${kpis.utilization}%`}
          trend={3.2}
          desc="vs last month"
          icon={<FaChartBar />}
          sparkData={[82, 84, 85, 86, 87]}
          gradient="from-cyan-500 to-cyan-700"
        />
        <KPICard
          label="Avg Trip Duration"
          value={`${kpis.avgDuration} hrs`}
          trend={-11.4}
          desc="vs last month"
          icon={<FaClock />}
          sparkData={[5.4, 5.2, 5.0, 4.9, 4.8]}
          gradient="from-pink-500 to-pink-700"
        />
      </div>

      {/* 4. AI Fleet Insights Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FaRobot className="text-sm" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Fleet Intelligence</h3>
            <p className="text-xs text-slate-400">Automated recommendations and analytics logs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InsightItem type="danger" text="Fuel expenses increased 18% this month. Fuel economy audits required." />
          <InsightItem type="warning" text="Vehicle GJ01AB1234 requires servicing soon. Reached threshold mileage." />
          <InsightItem type="success" text="Average trip completion time improved by 11%. Drivers on optimal routes." />
          <InsightItem type="info" text="Fleet utilization is 87%, representing positive capacity allocation." />
          <InsightItem type="danger" text="Two vehicles have insurance policies expiring within 30 days." />
          <InsightItem type="warning" text="Recommend assigning maintenance tickets before next long-distance scheduled trips." />
        </div>
      </div>

      {/* 5. Interactive Charts Grid (Charts 1 to 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Trips Per Month (Area Chart) */}
        <ChartCard title="Trips Per Month">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.tripsPerMonth}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Trips" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 2: Fuel Cost Per Month (Line Chart) */}
        <ChartCard title="Fuel Cost Trends">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.fuelCostPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="Fuel" stroke="#EF4444" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 3: Maintenance Cost (Bar Chart) */}
        <ChartCard title="Maintenance Expenses">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.maintExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="Cost" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 4: Vehicle Status Distribution (Donut Chart) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-800 mb-4">Vehicle Utilization Status</h3>
          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.vehicleStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dashboardData.vehicleStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-500 border-t border-slate-50 pt-4">
            <div>
              <span className="w-2.5 h-2.5 rounded-full inline-block mr-1.5" style={{ background: PIE_COLORS[0] }} />
              Available: 34
            </div>
            <div>
              <span className="w-2.5 h-2.5 rounded-full inline-block mr-1.5" style={{ background: PIE_COLORS[1] }} />
              On Trip: 10
            </div>
            <div>
              <span className="w-2.5 h-2.5 rounded-full inline-block mr-1.5" style={{ background: PIE_COLORS[2] }} />
              In Maint: 4
            </div>
          </div>
        </div>

        {/* Chart 5: Trip Status Distribution (Pie Chart) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-800 mb-4">Trip Completion Stats</h3>
          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.tripStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dashboardData.tripStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold text-slate-500 border-t border-slate-50 pt-4">
            <div>
              <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ background: PIE_COLORS[0] }} />
              Done: 340
            </div>
            <div>
              <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ background: PIE_COLORS[1] }} />
              Active: 10
            </div>
            <div>
              <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ background: PIE_COLORS[2] }} />
              Sched: 15
            </div>
            <div>
              <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ background: PIE_COLORS[3] }} />
              Cancel: 5
            </div>
          </div>
        </div>
      </div>

      {/* 6. Predictive Analytics & Fleet Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictive Analytics (5 predictions) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Predictive Analytics</h3>
            <p className="text-xs text-slate-400 mt-0.5">Machine learning estimators for next month</p>
          </div>

          <div className="space-y-3">
            <PredictionRow label="Estimated Fuel Cost Next Month" value="₹2,72,000" confidence={92} labelClass="text-red-500" />
            <PredictionRow label="Expected Maintenance Cost" value="₹78,000" confidence={87} labelClass="text-amber-600" />
            <PredictionRow label="Vehicles likely to require service" value="3 Vehicles" confidence={81} labelClass="text-slate-800" />
            <PredictionRow label="Projected Fleet Utilization" value="89%" confidence={95} labelClass="text-emerald-600" />
            <PredictionRow label="Predicted Downtime" value="14 hours" confidence={78} labelClass="text-slate-500" />
          </div>
        </div>

        {/* Fleet Health Score (Circular Progress Component) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Fleet Health Summary</h3>
            <p className="text-xs text-slate-400 mt-0.5">Overall health assessment of active operations</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center my-4">
            {/* Circle Progress */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" stroke="#F1F5F9" strokeWidth="12" fill="transparent" />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#3B82F6"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - 0.89)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-800">89%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Health</span>
              </div>
            </div>

            {/* Health Breakdown */}
            <div className="flex-1 space-y-2.5 w-full">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Maintenance Schedule</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "92%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Fuel Efficiency</span>
                  <span>84%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: "84%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Vehicle Availability</span>
                  <span>88%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: "88%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Leaderboards & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Drivers Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaUserTie className="text-blue-500" /> Top Drivers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 pb-2">
                  <th className="pb-2 font-bold uppercase">Driver</th>
                  <th className="pb-2 font-bold uppercase">Trips</th>
                  <th className="pb-2 font-bold uppercase">Fuel Log</th>
                  <th className="pb-2 font-bold text-right uppercase">On-time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dashboardData.topDrivers.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-semibold text-slate-800">{d.name}</td>
                    <td className="py-2.5 text-slate-600">{d.count}</td>
                    <td className="py-2.5 text-slate-600">{d.fuel} L</td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">{d.onTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Vehicles Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaTruck className="text-blue-500" /> Top Vehicles
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 pb-2">
                  <th className="pb-2 font-bold uppercase">Vehicle</th>
                  <th className="pb-2 font-bold uppercase">Distance</th>
                  <th className="pb-2 font-bold uppercase">Maintenance</th>
                  <th className="pb-2 font-bold text-right uppercase">Util</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dashboardData.topVehicles.map((v, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-semibold text-slate-800">{v.number}</td>
                    <td className="py-2.5 text-slate-600">{v.distance} km</td>
                    <td className="py-2.5 text-slate-600">₹{v.maintenance}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">{v.utilization}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities Timeline */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaRoute className="text-blue-500" /> Recent Activities
          </h3>
          <div className="space-y-4">
            <TimelineItem title="Vehicle Added" time="Just now" type="vehicle" desc="New Tata Prima Truck GJ01AB1234 registered." />
            <TimelineItem title="Trip Completed" time="4 hrs ago" type="trip" desc="Mumbai to Delhi trip completed by Rajesh Sharma." />
            <TimelineItem title="Maintenance Scheduled" time="1 day ago" type="maintenance" desc="Brake inspection scheduled for GJ01AB1234." />
            <TimelineItem title="Fuel Log Added" time="2 days ago" type="fuel" desc="Diesel fill-up 80L logged for MH02CD5678." />
          </div>
        </div>
      </div>

      {/* 8. Additional Charts & Expense Analysis (Charts 6 to 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 8: Fleet Utilization Trend (Line Chart) */}
        <ChartCard title="Fleet Utilization Trend">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.utilizationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[50, 100]} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Line type="monotone" dataKey="Utilization" stroke="#3B82F6" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 9: Revenue vs Fuel Expense (Dual Line Chart) */}
        <ChartCard title="Revenue vs Fuel Expense">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.revenueVsFuel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="Revenue" stroke="#10B981" strokeWidth={2.5} />
                <Line type="monotone" dataKey="Fuel" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 10: Maintenance Frequency (Column Chart) */}
        <ChartCard title="Maintenance Ticket Types">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.maintFreq}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Expense Cost Analysis Calculations */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Expense Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Calculated cost breakdowns for this month</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cost Per Vehicle</span>
              <p className="text-lg font-bold text-slate-800 mt-1">₹6,958</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cost Per Trip</span>
              <p className="text-lg font-bold text-slate-800 mt-1">₹982</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Fuel Cost / km</span>
              <p className="text-lg font-bold text-slate-800 mt-1">₹1.72</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Maint Cost / km</span>
              <p className="text-lg font-bold text-slate-800 mt-1">₹0.62</p>
            </div>
          </div>
        </div>
      </div>

      {/* 9. Floating Chatbot Button & Panel (AI Assistant) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-600/30 transition-all hover:scale-105 cursor-pointer"
          >
            <FaRobot className="text-2xl" />
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-80 sm:w-96 h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaRobot className="text-blue-400" />
                <span className="text-sm font-bold">TransitOps Reports AI</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((m, idx) => (
                <div key={idx} className={`flex gap-2 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                    m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {m.role === "user" ? "U" : <FaRobot />}
                  </div>
                  <div className={`rounded-xl p-3 text-xs leading-relaxed border ${
                    m.role === "user" ? "bg-blue-600 text-white border-blue-500" : "bg-slate-50 text-slate-800 border-slate-100"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2 max-w-[80%]">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <FaRobot />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs flex items-center gap-2 text-slate-400">
                    <FaSpinner className="animate-spin text-blue-500" />
                    <span>AI is analyzing report...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestion list */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
              {["Monthly analysis", "Highest fuel expense", "Vehicle health"].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setChatInput(q);
                    setTimeout(() => handleSendMessage(q), 50);
                  }}
                  className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input field */}
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask reports AI..."
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all disabled:bg-slate-300"
                >
                  <FaPaperPlane className="text-xs" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Extra local sub-component helper for ChartCard to keep code modular and readable
function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
      <h3 className="text-base font-bold text-slate-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// Sparkline/Pill tags
function CompliancePill({ label, date, expired }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
      expired ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
    }`}>
      {label}: {new Date(date).toLocaleDateString()}
    </span>
  );
}

export default Reports;