import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { registerUser } from "../../services/authService";

function Register() {
    const navigate = useNavigate();

    const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
  try {
    // Don't send confirmPassword to backend
    delete data.confirmPassword;

    const res = await registerUser(data);

    toast.success(res.data.message);

    navigate("/login");

  } catch (error) {

    toast.error(
      error.response?.data?.message || "Registration failed"
    );

  }
};

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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">

            <input
                type="text"
                placeholder="Full Name"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                {...register("fullName", {
                    required: "Full name is required",
                })}
                />

                {errors.fullName && (
                <p className="text-red-500 text-sm">
                    {errors.fullName.message}
                </p>
                )}

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
                type="tel"
                placeholder="Phone Number"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter a valid 10-digit phone number",
                    },
                })}
                />

                {errors.phone && (
                <p className="text-red-500 text-sm">
                    {errors.phone.message}
                </p>
                )}

            <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            {...register("password", {
                required: "Password is required",
                minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
                },
            })}
            />

            {errors.password && (
            <p className="text-red-500 text-sm">
                {errors.password.message}
            </p>
            )}

            <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            {...register("confirmPassword", {
                required: "Confirm your password",
                validate: (value) =>
                value === watch("password") ||
                "Passwords do not match",
            })}
            />

            {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
            </p>
            )}

            <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 transition"
            >
            Create Account
            </button>

        </form>

          <p className="mt-6 text-center">

            Already have an account?

            <Link
                to="/login"
                className="text-blue-600 ml-2 font-semibold"
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