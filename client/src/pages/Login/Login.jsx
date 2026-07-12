import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="min-h-screen flex">

      {/* Left Side */}

      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white items-center justify-center">

        <div>

          <h1 className="text-5xl font-bold mb-6">
            TransitOps ERP
          </h1>

          <p className="text-lg text-slate-300">
            Smart Transport Operations Platform
          </p>

        </div>

      </div>

      {/* Right Side */}

      <div className="flex-1 flex items-center justify-center bg-slate-100">

        <div className="bg-white p-10 rounded-xl shadow-xl w-[420px]">

          <h2 className="text-3xl font-bold mb-8">
            Welcome Back
          </h2>

          <form className="space-y-5">

            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border rounded-lg px-4 py-3"
            />

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
            >
              Login
            </button>

          </form>

          <p className="mt-6 text-center">

            Don't have an account?

            <Link
              to="/register"
              className="text-blue-600 ml-2"
            >
              Register
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;