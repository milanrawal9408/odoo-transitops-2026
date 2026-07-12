import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

function DashboardLayout() {
  return (
    <>
      <Navbar />

      <div
        style={{
          display: "flex"
        }}
      >
        <Sidebar />

        <main
          style={{
            flex: 1,
            padding: "20px"
          }}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default DashboardLayout;