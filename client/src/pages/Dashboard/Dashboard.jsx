import StatCard from "../../components/dashboard/StatCard";

function Dashboard() {

    return (

        <>

            <h1>Dashboard</h1>

            <br />

            <div

                style={{

                    display: "flex",

                    gap: "20px",

                    flexWrap: "wrap"

                }}

            >

                <StatCard

                    title="Vehicles"

                    value="48"

                />

                <StatCard

                    title="Drivers"

                    value="32"

                />

                <StatCard

                    title="Trips"

                    value="18"

                />

                <StatCard

                    title="Fuel Logs"

                    value="250"

                />

            </div>

        </>

    );

}

export default Dashboard;