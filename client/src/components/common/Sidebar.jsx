import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaTruck,
  FaUserTie,
  FaRoute,
  FaTools,
  FaGasPump,
  FaChartBar,
} from "react-icons/fa";

function Sidebar() {
  const menus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      name: "Vehicles",
      path: "/vehicles",
      icon: <FaTruck />,
    },
    {
      name: "Drivers",
      path: "/drivers",
      icon: <FaUserTie />,
    },
    {
      name: "Trips",
      path: "/trips",
      icon: <FaRoute />,
    },
    {
      name: "Maintenance",
      path: "/maintenance",
      icon: <FaTools />,
    },
    {
      name: "Fuel",
      path: "/fuel",
      icon: <FaGasPump />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FaChartBar />,
    },
  ];

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
        {menus.map((menu) => (
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
            <span>{menu.name}</span>
          </NavLink>
        ))}
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