import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="min-h-screen flex">

      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white items-center justify-center">

        <div>

          <h1 className="text-5xl font-bold mb-6">
            TransitOps ERP
          </h1>

          <p className="text-lg text-slate-300">
            Create your account
          </p>

        </div>

      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-100">

        <div className="bg-white p-10 rounded-xl shadow-xl w-[450px]">

          <h2 className="text-3xl font-bold mb-8">
            Create Account
          </h2>

        <form className="mt-8 space-y-5">

            <input
                type="text"
                placeholder="Full Name"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
                type="email"
                placeholder="Email Address"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
                type="tel"
                placeholder="Phone Number"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
                type="password"
                placeholder="Password"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
                type="password"
                placeholder="Confirm Password"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 transition"
            >
                Create Account
            </button>

        </form>

          <p className="mt-6 text-center text-gray-600">

                Already have an account?

                <Link
                    to="/login"
                    className="text-blue-600 font-semibold ml-2 hover:underline"
                >
                    Login
                </Link>

            </p>

        </div>

      </div>

    </div>
  );
}

export default Register;