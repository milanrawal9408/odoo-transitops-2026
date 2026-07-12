function StatCard({

    title,

    value

}) {

    return (

        <div

            style={{

                width: "220px",

                padding: "20px",

                borderRadius: "12px",

                background: "white",

                boxShadow: "0 0 8px rgba(0,0,0,.15)"

            }}

        >

            <h3>{title}</h3>

            <h1>{value}</h1>

        </div>

    );

}

export default StatCard;