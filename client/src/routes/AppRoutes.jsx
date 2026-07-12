import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Login/Register";

import Dashboard from "../pages/Dashboard/Dashboard";
import Vehicles from "../pages/Vehicles/Vehicles";
import Drivers from "../pages/Drivers/Drivers";
import Trips from "../pages/Trips/Trips";
import TripDetail from "../pages/Trips/TripDetail";
import AddTrip from "../pages/Trips/AddTrip";
import EditTrip from "../pages/Trips/EditTrip";
import Maintenance from "../pages/Maintenance/Maintenance";

import Fuel from "../pages/Fuel/Fuel";

import Reports from "../pages/Reports/Reports";
import AIAssistant from "../pages/AIAssistant/AIAssistant";
import Profile from "../pages/Profile/Profile";
import UserRoles from "../pages/UserRoles/UserRoles";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Layout Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* General Access */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />


          {/* Vehicles (Admin, Fleet Manager, Safety Officer, Driver) */}
          <Route
            element={<ProtectedRoute allowedRoles={["Admin", "Fleet Manager", "Safety Officer", "Driver"]} />}
          >
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/fuel" element={<Fuel />} />
          </Route>

          {/* Drivers Management (Admin, Fleet Manager) */}
          <Route element={<ProtectedRoute allowedRoles={["Admin", "Fleet Manager"]} />}>
            <Route path="/drivers" element={<Drivers />} />
          </Route>

          {/* Trips View / Details (Admin, Fleet Manager, Driver) */}
          <Route element={<ProtectedRoute allowedRoles={["Admin", "Fleet Manager", "Driver"]} />}>
            <Route path="/trips" element={<Trips />} />
            <Route path="/trips/:id" element={<TripDetail />} />
          </Route>

          {/* Trips Modification (Admin, Fleet Manager) */}
          <Route element={<ProtectedRoute allowedRoles={["Admin", "Fleet Manager"]} />}>
            <Route path="/trips/add" element={<AddTrip />} />
            <Route path="/trips/:id/edit" element={<EditTrip />} />
          </Route>

          {/* Maintenance (Admin, Fleet Manager, Safety Officer) */}
          <Route
            element={<ProtectedRoute allowedRoles={["Admin", "Fleet Manager", "Safety Officer"]} />}
          >
            <Route path="/maintenance" element={<Maintenance />} />
          </Route>

          {/* Reports (Admin, Financial Analyst) */}
          <Route element={<ProtectedRoute allowedRoles={["Admin", "Financial Analyst"]} />}>
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* AI Fleet Assistant (Admin, Fleet Manager) */}
          <Route element={<ProtectedRoute allowedRoles={["Admin", "Fleet Manager"]} />}>
            <Route path="/ai-assistant" element={<AIAssistant />} />
          </Route>

          {/* User Management / Roles (Admin Only) */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/user-roles" element={<UserRoles />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;