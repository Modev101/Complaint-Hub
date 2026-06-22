import React, { useState, type Dispatch, type SetStateAction } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { AuthResponse } from "../types/index.ts";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import States from "../../data/States.json";
import { SelectForm } from "../components/SelectForm";

const schema = yup
  .object({
    state: yup.string().required(),
    county: yup.string().required(),
    town: yup.string().required(),
    storeName: yup
      .string()
      .required("Store Name is required")
      .min(2, "Store Name must be at least 2 characters"),

    phoneNumber: yup
      .string()
      .required("Phone number is required")
      .matches(
        /^(\+1\s?)?(\([2-9]\d{2}\)|[2-9]\d{2})[-.\s]?\d{3}[-.\s]?\d{4}$/,
        "Enter a valid US phone number",
      ),
  })
  .required();
interface Duration {
  value: string;
  label: string;
}
interface Duration {
  value: string;
  label: string;
}

const DISTRIBUTER: Duration[] = [
  { value: "ws", label: "Wholesaler" },
  { value: "dst", label: "Distributer" },
  { value: "oth", label: "Other" },
];
type FormData = yup.InferType<typeof schema>;
export default function Register({
  setUser,
}: {
  setUser: Dispatch<SetStateAction<AuthResponse | null>>;
}) {
  const [formData, setFormData] = useState({
    storeName: "",
    email: "",
    password: "",
    role: "",
  });
  const {
    register,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const [selectedState, setSelectedState] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [distributer, setDistributer] = useState<string>("");

  const stateOptions = States.states.map((state) => ({
    label: state.name,
    value: state.name,
  }));

  const selectedStateData = States.states.find(
    (state) => state.name === selectedState,
  );

  const countyOptions = selectedStateData
    ? selectedStateData.counties.map((county) => ({
        label: county.name,
        value: county.name,
      }))
    : [];

  const selectedCountyData = selectedStateData?.counties.find(
    (county) => county.name === selectedCounty,
  );

  const townOptions = selectedCountyData
    ? selectedCountyData.towns.map((town) => ({
        label: town,
        value: town,
      }))
    : [];

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCounty("");
    setSelectedTown("");
  };

  const handleCountyChange = (value: string) => {
    setSelectedCounty(value);
    setSelectedTown("");
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

      navigate("/user/seller/complaints");
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
                <div>
                  <label
                    htmlFor="storeName"
                    className="block mb-2 font-medium cursor-pointer"
                  >
                    Store Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="storeName"
                    type="text"
                    name="storeName"
                    placeholder="Enter your store name"
                    value={formData.storeName}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-1 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="font-medium cursor-pointer"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>

                  <input
                    {...register("phoneNumber")}
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter your phone number"
                    className="w-full mt-2 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 no-spinner"
                  />
                  <p className="text-red-500 text-sm">
                    {errors.phoneNumber?.message}
                  </p>
                </div>

                <label className="font-medium">
                  State <span className="text-red-500">*</span>
                </label>
                <div>
                  <SelectForm
                    options={stateOptions}
                    value={selectedState}
                    onValueChange={(value) => {
                      handleStateChange(value);

                      setValue("state", value, {
                        shouldValidate: true,
                      });

                      setValue("county", "");
                      setValue("town", "");
                    }}
                  />
                  <p className="text-red-500 text-sm">
                    {errors.state?.message}
                  </p>
                </div>
                <label className="font-medium">
                  County <span className="text-red-500">*</span>
                </label>
                <div>
                  <SelectForm
                    options={countyOptions}
                    value={selectedCounty}
                    onValueChange={(value) => {
                      handleCountyChange(value);

                      setValue("county", value, {
                        shouldValidate: true,
                      });

                      setValue("town", "");
                    }}
                  />
                  <p className="text-red-500 text-sm">
                    {errors.county?.message}
                  </p>
                </div>
                <label className="font-medium">
                  Town <span className="text-red-500">*</span>
                </label>
                <div>
                  <SelectForm
                    options={townOptions}
                    value={selectedTown}
                    onValueChange={(value) => {
                      setSelectedTown(value);
                      setValue("town", value, { shouldValidate: true });
                    }}
                  />
                  <p className="text-red-500 text-sm">{errors.town?.message}</p>
                </div>
                <label className="font-medium">
                  Your Platform <span className="text-red-500">*</span>
                </label>
                <SelectForm
                  options={DISTRIBUTER}
                  value={distributer}
                  onValueChange={(value) => {
                    setDistributer(value);
                  }}
                />
                <div className="flex items-center justify-center gap-4 pt-2">
                  <Link
                    to="/"
                    className="border-gray-300 border px-6 py-3 rounded-lg flex items-center gap-2  hover:opacity-70 transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="bg-red-700 cursor-pointer hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-6 py-3 transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
