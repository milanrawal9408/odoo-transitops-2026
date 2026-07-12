import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { loginUser } from "../../services/authService";

function Login() {

   const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            const res = await loginUser(data);

            toast.success(res.data.message);

            navigate("/dashboard");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Login Failed"
            );
        }
    };

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

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">

            <input
              type="email"
              placeholder="Email Address"
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              {...register("email", {
                required: "Email is required",
              })}
            />

            {errors.email && (
              <p className="text-red-500 text-sm">
                {errors.email.message}
              </p>
            )}

            <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            {...register("password", {
              required: "Password is required",
            })}
          />

          {errors.password && (
            <p className="text-red-500 text-sm">
              {errors.password.message}
            </p>
          )}

           <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 transition"
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