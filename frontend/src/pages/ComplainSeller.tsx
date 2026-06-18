import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";

import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";

const schema = yup.object({
  seller: yup
    .string()
    .required("Seller name is required")
    .min(3, "Seller name must be at least 3 characters"),

  sellerContact: yup.string().required("Seller contact is required"),

  platform: yup.string().required("Please select a platform"),

  complain: yup
    .string()
    .required("Complaint is required")
    .min(20, "Complaint must be at least 20 characters"),
});

type FormData = yup.InferType<typeof schema>;

export default function ComplainSeller() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    reset();
    setSubmitted(true);
  };
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold animate-text">Thank You!</h2>

          <p className="mt-3 text-gray-600">
            Your complaint has been submitted successfully.
          </p>

          <Link
            to="/user/consumer"
            className="inline-block mt-6 rounded-lg bg-red-600 px-6 py-2 text-white"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="min-h-screen my-10 lg:my-0 flex flex-col items-center justify-center px-5">
        <div className="flex flex-col lg:flex-row md:flex-row items-start lg:items-center md:items-center justify-center space-x-5 mb-3">
          <Link to="/user/consumer" className="text-2xl animate-bounce">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h1 className="text-3xl font-bold text-center text-red-600 mb-2">
            Complain A Seller
          </h1>
        </div>
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <label htmlFor="Seller" className="font-medium cursor-pointer">
              Seller name <span className="text-red-500">*</span>
            </label>
            <div>
              <input
                {...register("seller")}
                placeholder="Enter seller name"
                className="w-full mt-2 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
              />

              <p className="text-sm text-red-500 mt-1">
                {errors.seller?.message}
              </p>
            </div>
            <label
              htmlFor="sellercontact"
              className="font-medium cursor-pointer"
            >
              Seller contact <span className="text-red-500">*</span>
            </label>
            <div>
              <input
                {...register("sellerContact")}
                placeholder="Email, phone number..."
                className="w-full mt-2 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
              />

              <p className="text-sm text-red-500 mt-1">
                {errors.sellerContact?.message}
              </p>
            </div>

            <div>
              <label className="block mb-2 font-medium cursor-pointer">
                Seller Platform <span className="text-red-500">*</span>
              </label>

              <Controller
                name="platform"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full py-3">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="STORE">STORE</SelectItem>
                      <SelectItem value="MARKET">MARKET</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <p className="text-sm text-red-500 mt-1">
                {errors.platform?.message}
              </p>
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

              <p className="text-sm text-red-500 mt-1">
                {errors.complain?.message}
              </p>
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
