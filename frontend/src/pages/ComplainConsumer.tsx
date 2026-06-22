import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import companies from "../../data/Companies.json";
import { SelectForm } from "../components/SelectForm";
import { useEffect, useState } from "react";
import States from "../../data/States.json";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";

const schema = yup
  .object({
    company: yup.string().required(),
    product: yup.string().required(),
    state: yup.string().required(),
    county: yup.string().required(),
    town: yup.string().required(),
    complain: yup.string().required().min(20),
    name: yup
      .string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),

    phoneNumber: yup
      .string()
      .required("Phone number is required")
      .matches(
        /^(\+1\s?)?(\([2-9]\d{2}\)|[2-9]\d{2})[-.\s]?\d{3}[-.\s]?\d{4}$/,
        "Enter a valid US phone number",
      ),

    email: yup
      .string()
      .required("Email is required")
      .email("Enter a valid email"),

    productImage: yup.mixed<FileList>().required("Product image is required"),
  })
  .required();

type ComplaintFormData = yup.InferType<typeof schema>;

export default function ComplainProducts() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: yupResolver(schema),
  });
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const onSubmit = async (data: ComplaintFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await axios.post(`${apiUrl}/api/auth/user/consumer/complaints`, {
        companyName: data.company,
        companyProduct: data.product,
        state: data.state,
        county: data.county,
        town: data.town,
        complain: data.complain,
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email,
      });

      reset();
      setPreview(null);
      setSelectedCompany("");
      setSelectedProduct("");
      setSelectedState("");
      setSelectedCounty("");
      setSelectedTown("");
      setSubmitted(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSubmitError(
          err.response?.data?.message ??
            "Failed to submit complaint. Please try again.",
        );
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const companyName = companies.map((c) => ({
    label: c.name,
    value: c.name,
  }));
  const selectedCompanyData = companies.find((c) => c.name === selectedCompany);

  const productOptions = selectedCompanyData
    ? selectedCompanyData.products.map((p) => ({
        label: p.name,
        value: p.name,
      }))
    : [];
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);
  const imageRegister = register("productImage");
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));
  };
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold animate-text">Thank You!</h2>

          <p className="mt-4 text-gray-600">
            Your complaint has been submitted successfully.
          </p>

          <Link
            to="/"
            className="mt-6 inline-block bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen my-10 flex flex-col items-center justify-center px-5">
        <div className="flex flex-col lg:flex-row md:flex-row items-start lg:items-center md:items-center justify-center space-x-5 mb-3">
          <Link to="/" className="text-2xl animate-bounce">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h1 className="text-3xl font-bold text-center text-red-600 mb-2">
            Complain A Product
          </h1>
        </div>
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <label className="font-medium">
              Company name <span className="text-red-500">*</span>
            </label>
            <div>
              <SelectForm
                options={companyName}
                value={selectedCompany}
                onValueChange={(value) => {
                  setSelectedCompany(value);
                  setValue("company", value, { shouldValidate: true });
                }}
              />

              <p className="text-red-500 text-sm">{errors.company?.message}</p>
            </div>
            <label className="font-medium">
              Company product <span className="text-red-500">*</span>
            </label>
            <div>
              <SelectForm
                options={productOptions}
                value={selectedProduct}
                onValueChange={(value) => {
                  setSelectedProduct(value);
                  setValue("product", value, { shouldValidate: true });
                }}
              />

              <p className="text-red-500 text-sm">{errors.product?.message}</p>
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
              <p className="text-red-500 text-sm">{errors.state?.message}</p>
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
              <p className="text-red-500 text-sm">{errors.county?.message}</p>
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

            <div>
              <label
                htmlFor="productImage"
                className="font-medium cursor-pointer"
              >
                Upload Product Image <span className="text-red-500">*</span>
              </label>

              <input
                type="file"
                className="w-full mt-2 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 file:mr-4 file:rounded-md file:border-0 file:bg-red-500 file:px-4 file:py-2 file:text-white hover:file:bg-red-600"
                accept="image/*"
                {...imageRegister}
                onChange={(e) => {
                  imageRegister.onChange(e);
                  handleImageChange(e);
                }}
              />
              <p className="text-red-500 text-sm">
                {errors.productImage?.message}
              </p>

              {preview && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">Image Preview</p>
                  <img
                    src={preview}
                    alt="Product Preview"
                    className="h-48 w-48 rounded-lg border object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="complain" className="font-medium cursor-pointer">
                Complain <span className="text-red-500">*</span>
              </label>

              <textarea
                {...register("complain")}
                placeholder="Your complaint"
                className="w-full mt-2 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
              />

              <p className="text-red-500 text-sm">{errors.complain?.message}</p>
            </div>

            <div>
              <label htmlFor="name" className="font-medium cursor-pointer">
                Name <span className="text-red-500">*</span>
              </label>

              <input
                {...register("name")}
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                className="w-full mt-2 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-red-500 text-sm">{errors.name?.message}</p>
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
            <div>
              <label htmlFor="email" className="font-medium cursor-pointer">
                Email <span className="text-red-500">*</span>
              </label>

              <input
                {...register("email")}
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full mt-2 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>

            <div className="flex flex-col items-center gap-3 pt-2">
              {submitError && (
                <p className="text-red-500 text-sm text-center">
                  {submitError}
                </p>
              )}
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/"
                  className="border-gray-300 border px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-70 transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-700 cursor-pointer hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-6 py-3 transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
