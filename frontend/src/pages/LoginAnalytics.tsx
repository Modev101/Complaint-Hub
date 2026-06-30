import axios from "axios";
import { useAuth } from "../../context/useAuth";
import { ChartAreaIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [loading, setLoading] = useState(false);
  const [resError, setResError] = useState(false);

  const { setAdmin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${apiUrl}/api/auth/admin/login`,
        formData,
        {
          withCredentials: true,
        },
      );

      setAdmin(data.user);

      navigate("/analytics/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setResError(error.response?.data?.message || "Request failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <>
          <div className="flex justify-center items-center min-h-[80vh]">
            <Loader2 className="animate-spin size-16 text-red-500 mx-auto mb-6" />
          </div>
        </>
      ) : (
        <>
          <div className="lg:h-[80vh] my-5 flex items-center justify-center px-5">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <ChartAreaIcon className="text-red-500 size-10" />
                <p className="text-center text-gray-500 mb-8">
                  Analytics Login
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="font-medium cursor-pointer">
                    Email <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="w-full mt-2 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {resError && (
                    <p className="pl-4 italic text-sm text-red-500 font-semibold">
                      {resError}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="font-medium cursor-pointer"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="w-full mt-2 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {resError && (
                    <p className="pl-4 italic text-sm text-red-500 font-semibold">
                      {resError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-400 text-white py-3 rounded-lg font-semibold transition cursor-pointer"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
