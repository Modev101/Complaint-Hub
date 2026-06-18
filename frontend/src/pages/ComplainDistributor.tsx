import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";

const schema = yup.object({
  distributerName: yup
    .string()
    .required("Distributor name is required")
    .min(3, "Minimum 3 characters"),

  distributerContact: yup.string().required("Contact is required"),

  complain: yup
    .string()
    .required("Complaint is required")
    .min(10, "Minimum 10 characters"),
});

type FormData = yup.InferType<typeof schema>;

export default function ComplainDistributer() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  const onSubmit = (data: FormData) => {
    reset();
    setSubmitted(true);
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
            to="/user/seller"
            className="mt-6 inline-block bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="lg:h-[80vh] lg:my-0 lg:mt-5 my-10 flex flex-col items-center justify-center px-5">
        <div className="flex flex-col lg:flex-row md:flex-row items-start lg:items-center md:items-center justify-center space-x-5 mb-3">
          <Link to="/user/seller" className="text-2xl animate-bounce">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h1 className="text-3xl font-bold text-center text-red-600 mb-2">
            Complain A Distributer
          </h1>
        </div>
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <label htmlFor="distributer" className="font-medium">
              Distributer name <span className="text-red-500">*</span>
            </label>
            <div>
              <input
                {...register("distributerName")}
                id="distributer"
                type="text"
                placeholder="Enter a name"
                className="w-full mt-2 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
              />

              <p className="text-sm text-red-500">
                {errors.distributerName?.message}
              </p>
            </div>
            <label htmlFor="distributercontact" className="font-medium">
              Distributer contact <span className="text-red-500">*</span>
            </label>
            <div>
              <input
                {...register("distributerContact")}
                id="distributercontact"
                type="text"
                placeholder="email, phone number..."
                className="w-full mt-2 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
              />

              <p className="text-sm text-red-500">
                {errors.distributerContact?.message}
              </p>
            </div>

            <div>
              <label htmlFor="complain" className="font-medium cursor-pointer">
                Complain <span className="text-red-500">*</span>
              </label>

              <textarea
                {...register("complain")}
                placeholder="your complain"
                className="w-full mt-2 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
              />

              <p className="text-sm text-red-500">{errors.complain?.message}</p>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-400 text-white py-3 rounded-lg font-semibold transition cursor-pointer"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
