import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaTachometerAlt,
  FaTruck,
  FaUserTie,
  FaRoute,
  FaTools,
  FaGasPump,
  FaChartBar,
  FaRobot,
  FaUser,
  FaSpinner,
  FaUsersCog,
  FaUserShield,
} from "react-icons/fa";

function Sidebar() {
  const { user, loading } = useAuth();

  const allMenus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaTachometerAlt />,
      roles: ["Admin", "Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"],
    },
    {
      name: "User Management",
      path: "/users",
      icon: <FaUsersCog />,
      roles: ["Admin"],
    },
    {
      name: "Vehicles",
      path: "/vehicles",
      icon: <FaTruck />,
      roles: ["Admin", "Fleet Manager", "Safety Officer", "Driver"],
      // Map display name for Drivers
      getDisplayName: (role) => (role === "Driver" ? "My Vehicle" : "Vehicles"),
    },
    {
      name: "Drivers",
      path: "/drivers",
      icon: <FaUserTie />,
      roles: ["Admin", "Fleet Manager"],
    },
    {
      name: "Trips",
      path: "/trips",
      icon: <FaRoute />,
      roles: ["Admin", "Fleet Manager", "Driver"],
      getDisplayName: (role) => (role === "Driver" ? "My Trips" : "Trips"),
    },
    {
      name: "Maintenance",
      path: "/maintenance",
      icon: <FaTools />,
      roles: ["Admin", "Fleet Manager", "Safety Officer"],
    },
    {
      name: "Fuel",
      path: "/fuel",
      icon: <FaGasPump />,
      roles: ["Admin", "Fleet Manager", "Financial Analyst"],
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FaChartBar />,
      roles: ["Admin", "Financial Analyst"],
    },
    {
      name: "AI Assistant",
      path: "/ai-assistant",
      icon: <FaRobot />,
      roles: ["Admin", "Fleet Manager"],
    },
    {
      name: "My Profile",
      path: "/profile",
      icon: <FaUser />,
      roles: ["Driver"],
    },
  ];

  if (loading) {
    return (
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col items-center justify-center h-screen shrink-0">
        <FaSpinner className="animate-spin text-slate-500 text-2xl" />
      </aside>
    );
  }

  const userRole = user?.role || "Driver";
  const visibleMenus = allMenus.filter((menu) => menu.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 h-screen shrink-0 shadow-lg">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/60 bg-slate-950/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-sm font-black tracking-widest text-white uppercase">
            Operations
          </h2>
        </div>
      </div>

      {/* Navigation Menus */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {visibleMenus.map((menu) => {
          const displayName = menu.getDisplayName
            ? menu.getDisplayName(userRole)
            : menu.name;

          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`
              }
            >
              <span className="text-base shrink-0">{menu.icon}</span>
              <span>{displayName}</span>
            </NavLink>
          );
        })}
      </div>

      {/* System Footer Info */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/10 text-center">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          TransitOps v1.2.0
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;