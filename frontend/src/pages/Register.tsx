import React, { useState, type Dispatch, type SetStateAction } from "react";
import axios from "axios";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { AuthResponse } from "../types/index.ts";

type UserRole = "SELLER" | "CONSUMER";

const Register = ({
  setUser,
}: {
  setUser: Dispatch<SetStateAction<AuthResponse | null>>;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CONSUMER" as UserRole,
  });

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
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${apiUrl}/api/auth/register`,
        formData,
      );

      setUser(data);

      navigate(data.user.role === "SELLER" ? "/user/seller" : "/user/consumer");
    } catch (error) {
      console.error("Login failed:", error);
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
          <div className="min-h-screen md:min-h-[70vh] my-10 max-w-3xl mx-auto flex items-center justify-center px-4">
            <div className="w-full bg-white rounded-2xl shadow-lg p-5">
              <h1 className="text-3xl font-bold text-center text-red-600 mb-2">
                Create Account
              </h1>

              <p className="text-center text-gray-500 mb-8">
                Register to start submitting and tracking complaints.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 font-medium cursor-pointer"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-1 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 font-medium cursor-pointer"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-1 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 font-medium cursor-pointer"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-1 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block mb-2 font-medium cursor-pointer">
                    Register As <span className="text-red-500">*</span>
                  </label>

                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: value as UserRole,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full py-3 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="CONSUMER">CONSUMER</SelectItem>
                      <SelectItem value="SELLER">SELLER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-400 transition font-semibold cursor-pointer"
                >
                  Register
                </button>
              </form>

              <p className="text-center text-gray-500 mt-6">
                Already have an account?
                <a
                  href="/login"
                  className="text-red-600 font-semibold ml-2 hover:underline"
                >
                  Login
                </a>
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Register;
