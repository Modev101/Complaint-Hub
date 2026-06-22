import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Check, Copy, Loader2 } from "lucide-react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import States from "../../data/States.json";
import { SelectForm } from "../components/SelectForm";
import { useAuth } from "../../context/useAuth";

const schema = yup.object({
  state: yup.string().required("State is required"),
  county: yup.string().required("County is required"),
  town: yup.string().required("Town is required"),

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
});

interface Option {
  value: string;
  label: string;
}

const DISTRIBUTER: Option[] = [
  { value: "Wholesaler", label: "Wholesaler" },
  { value: "Distributer", label: "Distributer" },
  { value: "Other", label: "Other" },
];

type FormData = yup.InferType<typeof schema>;

export default function Register() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [loading, setLoading] = useState(false);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [distributer, setDistributer] = useState("");

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

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

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const [userCode, setLocalUserCode] = useState(""); // ← rename local setter
  const [copied, setCopied] = useState(false);
  const [resError, setResError] = useState(false);

  const { setUserCode } = useAuth(); // ← auth context setter

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = { ...data, platform: distributer };
      const response = await axios.post(`${apiUrl}/api/auth/register`, payload);

      const code = response.data.user.code;
      setUserCode(code); // → auth context (guards the route)
      setLocalUserCode(code); // → local state (displays the code on screen)
    } catch (error) {
      console.error("Register failed:", error);
      if (axios.isAxiosError(error)) {
        setResError(error.response?.data?.message || "Request failed");
      }
    } finally {
      setLoading(false);
    }
  };
  if (userCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold">Welcome aboard!</h2>

          <p className="mt-4 text-gray-600">This is your login code</p>

          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="font-bold bg-gray-100 px-4 py-2 rounded">
              {userCode}
            </span>

            <button
              type="button"
              onClick={copyCode}
              className="p-2 rounded border"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <p className="mt-4 text-gray-600">Make sure you save it.</p>

          <Link
            to="/user/seller/complaints"
            className="mt-6 inline-block bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Well do!
          </Link>
        </div>
      </div>
    );
  }
  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center min-h-[80vh]">
          <Loader2 className="animate-spin size-16 text-red-500" />
        </div>
      ) : (
        <div className="min-h-screen my-10 max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h1 className="text-3xl font-bold text-center text-red-600">
              Create Account
            </h1>

            <p className="text-center text-gray-500 mb-8">
              Register to start submitting and tracking complaints.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Store Name */}
              <div>
                <label className="block mb-2 font-medium">Store Name</label>

                <input
                  {...register("storeName")}
                  type="text"
                  placeholder="Enter store name"
                  className="w-full border rounded-lg px-4 py-3"
                />

                <p className="text-red-500 text-sm">
                  {errors.storeName?.message}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-2 font-medium">Phone Number</label>

                <input
                  {...register("phoneNumber")}
                  type="tel"
                  placeholder="Phone number"
                  className="w-full border rounded-lg px-4 py-3"
                />

                <p className="text-red-500 text-sm">
                  {errors.phoneNumber?.message}
                </p>
              </div>

              {/* State */}
              <div>
                <label className="font-medium">State</label>

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

                <p className="text-red-500 text-sm">{errors.state?.message}</p>
              </div>

              {/* County */}
              <div>
                <label className="font-medium">County</label>

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

                <p className="text-red-500 text-sm">{errors.county?.message}</p>
              </div>

              {/* Town */}
              <div>
                <label className="font-medium">Town</label>

                <SelectForm
                  options={townOptions}
                  value={selectedTown}
                  onValueChange={(value) => {
                    setSelectedTown(value);

                    setValue("town", value, {
                      shouldValidate: true,
                    });
                  }}
                />

                <p className="text-red-500 text-sm">{errors.town?.message}</p>
              </div>

              {/* Platform */}
              <div>
                <label className="font-medium">Your Platform</label>

                <SelectForm
                  options={DISTRIBUTER}
                  value={distributer}
                  onValueChange={setDistributer}
                />
              </div>
              {resError && (
                <p className="pl-4 italic text-sm text-red-500 font-semibold">
                  {resError}
                </p>
              )}
              <div className="flex justify-center gap-4">
                <Link to="/" className="border px-6 py-3 rounded-lg">
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="bg-red-700 text-white px-6 py-3 rounded-lg"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
