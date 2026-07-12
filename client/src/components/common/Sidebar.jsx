import { NavLink } from "react-router-dom";

import {
    FaTachometerAlt,
    FaTruck,
    FaUserTie,
    FaRoute,
    FaTools,
    FaGasPump,
    FaChartBar
} from "react-icons/fa";

function Sidebar() {

    const menus = [

        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <FaTachometerAlt />
        },

        {
            name: "Vehicles",
            path: "/vehicles",
            icon: <FaTruck />
        },

        {
            name: "Drivers",
            path: "/drivers",
            icon: <FaUserTie />
        },

        {
            name: "Trips",
            path: "/trips",
            icon: <FaRoute />
        },

        {
            name: "Maintenance",
            path: "/maintenance",
            icon: <FaTools />
        },

        {
            name: "Fuel",
            path: "/fuel",
            icon: <FaGasPump />
        },

        {
            name: "Reports",
            path: "/reports",
            icon: <FaChartBar />
        }

    ];

    return (

        <aside
            style={{
                width: "230px",
                background: "#0F172A",
                color: "white",
                minHeight: "100vh",
                padding: "20px"
            }}
        >

            <h2>TransitOps</h2>

            <br />

            {

                menus.map((menu) => (

                    <NavLink

                        key={menu.path}

                        to={menu.path}

                        style={({ isActive }) => ({

                            display: "flex",

                            gap: "12px",

                            padding: "12px",

                            marginBottom: "10px",

                            textDecoration: "none",

                            color: "white",

                            borderRadius: "8px",

                            background: isActive ? "#2563EB" : "transparent"

                        })}

                    >

                        {menu.icon}

                        {menu.name}

                    </NavLink>

                ))

            }

        </aside>

    );

}

export default Sidebar;