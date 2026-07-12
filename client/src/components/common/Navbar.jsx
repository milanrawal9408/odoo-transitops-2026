import { useNavigate } from "react-router-dom";
import { FaTruck, FaSignOutAlt, FaUser, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };


  return (
    <nav className="h-16 border-b border-slate-100 bg-white px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
          <FaTruck className="text-base" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-black tracking-tight text-slate-800 leading-none">
            Transit<span className="text-blue-600">Ops</span>
          </span>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
            Enterprise ERP
          </span>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <FaSpinner className="animate-spin text-sm" />
            <span>Loading profile...</span>
          </div>
        ) : user ? (
          <div className="flex items-center gap-4">
            {/* Logged In User Info */}
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-700 leading-none">
                  {user.fullName}
                </p>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 block">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-red-100"
              title="Logout"
            >
              <FaSignOutAlt className="text-base" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
          >
            <FaUser />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;