import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Login/Register";

import Dashboard from "../pages/Dashboard/Dashboard";
import Vehicles from "../pages/Vehicles/Vehicles";
import Drivers from "../pages/Drivers/Drivers";
import Trips from "../pages/Trips/Trips";
import Maintenance from "../pages/Maintenance/Maintenance";
import Fuel from "../pages/Fuel/Fuel";
import Reports from "../pages/Reports/Reports";

import DashboardLayout from "../layouts/DashboardLayout";

function AppRoutes() {
  return (
    <Routes>

      {/* Authentication */}

      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard */}

      <Route element={<DashboardLayout />}>

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/fuel" element={<Fuel />} />
        <Route path="/reports" element={<Reports />} />

      </Route>

    </Routes>
  );
}

export default AppRoutes;