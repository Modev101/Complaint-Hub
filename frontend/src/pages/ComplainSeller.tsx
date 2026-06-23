import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ClipboardEvent,
  useEffect,
} from "react";
import { Check } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SelectForm } from "../components/SelectForm";
import * as yup from "yup";

interface Product {
  id: string;
  name: string;
}

interface Duration {
  value: string;
  label: string;
}

const ISSUES: string[] = [
  "Packaging problem",
  "Labeling/date issue",
  "Long delivery delay",
  "Insufficient delivered quantity",
  "Product quality issue",
  "Barcode error",
  "Price break",
  "Short expiration date",
  "Return policy not respected",
  "Broken Product",
];

const PRODUCTS: Product[] = [
  { id: "Olive oil 1L", name: "Olive oil 1L" },
  { id: "Semolina 5kg", name: "Semolina 5kg" },
  { id: "Tomato paste 400g", name: "Tomato paste 400g" },
  { id: "Milk powder 900g", name: "Milk powder 900g" },
  { id: "Couscous 1kg", name: "Couscous 1kg" },
];

const DURATIONS: Duration[] = [
  { value: "Less than 1 week", label: "Less than 1 week" },
  { value: "1 week to 1 month", label: "1 week to 1 month" },
  { value: "More than 1 month", label: "More than 1 month" },
];

const DISTRIBUTER: Duration[] = [
  { value: "Wholesaler", label: "Wholesaler" },
  { value: "Distributer", label: "Distributer" },
  { value: "Other", label: "Other" },
];

const MAX_ISSUES = 2;
const BARCODE_LENGTH = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DURATION_VALUES = DURATIONS.map((d) => d.value);
const DISTRIBUTER_VALUES = DISTRIBUTER.map((d) => d.value);

const reclamationSchema = yup.object({
  issues: yup
    .array()
    .of(yup.string().required())
    .min(1, "Pick at least one issue")
    .max(MAX_ISSUES, `Pick up to ${MAX_ISSUES} issues`)
    .required(),
  products: yup
    .array()
    .of(yup.string().required())
    .min(1, "Select at least one product")
    .required(),
  barcode: yup.string().when("products", {
    is: (products: string[]) => products.length === 0,
    then: (schema) =>
      schema
        .required("Barcode is required")
        .matches(
          new RegExp(`^\\d{${BARCODE_LENGTH}}$`),
          `Barcode must be ${BARCODE_LENGTH} digits`,
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
  duration: yup
    .string()
    .oneOf(DURATION_VALUES, "Pick a valid duration")
    .required("Please select how long you've had this product"),
  distributer: yup
    .string()
    .oneOf(DISTRIBUTER_VALUES, "Pick a valid option")
    .required("Please tell us who you bought it from"),
  image: yup
    .mixed<File>()
    .required("Image is a required field")
    .test("fileSize", "Image must be 5MB or smaller", (file) =>
      file ? file.size <= MAX_FILE_SIZE : true,
    )
    .test(
      "fileType",
      "Only JPG, PNG, WEBP or GIF images are allowed",
      (file) => (file ? ACCEPTED_IMAGE_TYPES.includes(file.type) : true),
    ),
  details: yup.string().max(500, "Keep it under 500 characters").optional(),
});

type ComplainSellerValues = yup.InferType<typeof reclamationSchema>;
type ComplainSellerErrors = Partial<Record<keyof ComplainSellerValues, string>>;

export default function ComplainSeller() {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [digits, setDigits] = useState<string[]>(
    Array(BARCODE_LENGTH).fill(""),
  );
  const [duration, setDuration] = useState<string>("");
  const [distributer, setDistributer] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [errors, setErrors] = useState<ComplainSellerErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleIssue = (issue: string): void => {
    setSelectedIssues((prev) => {
      if (prev.includes(issue)) return prev.filter((i) => i !== issue);
      if (prev.length >= MAX_ISSUES) return prev;
      return [...prev, issue];
    });
    setErrors((prev) => ({ ...prev, issues: undefined }));
  };

  const toggleProduct = (id: string): void => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
    setErrors((prev) => ({ ...prev, products: undefined }));
  };

  const allProductsSelected = selectedProducts.length === PRODUCTS.length;

  const selectAllProducts = (): void => {
    setSelectedProducts(allProductsSelected ? [] : PRODUCTS.map((p) => p.id));
  };

  const handleDigitChange = (idx: number, value: string): void => {
    const clean = value.replace(/[^0-9]/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = clean;
      return next;
    });
    if (clean && idx < BARCODE_LENGTH - 1) {
      const nextInput = document.getElementById(`barcode-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleDigitKeyDown = (
    idx: number,
    e: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      const prevInput = document.getElementById(`barcode-${idx - 1}`);
      prevInput?.focus();
    }
  };

  const handleDigitPaste = (e: ClipboardEvent<HTMLInputElement>): void => {
    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!text) return;
    e.preventDefault();
    setDigits((prev) => {
      const next = [...prev];
      text
        .slice(0, BARCODE_LENGTH)
        .split("")
        .forEach((ch, i) => {
          next[i] = ch;
        });
      return next;
    });
    const lastIdx = Math.min(text.length, BARCODE_LENGTH) - 1;
    if (lastIdx >= 0) {
      document.getElementById(`barcode-${lastIdx}`)?.focus();
    }
  };

  const isOpen = selectedIssues.length > 0;
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const resetForm = (): void => {
    setSelectedIssues([]);
    setSelectedProducts([]);
    setDigits(Array(BARCODE_LENGTH).fill(""));
    setDuration("");
    setDistributer("");
    setDetails("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setImageFile(null);
    setErrors({});
    setSubmitError(null);
    setSubmitted(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const values = {
      issues: selectedIssues,
      products: selectedProducts,
      barcode: digits.join(""),
      duration,
      distributer,
      image: imageFile,
      details,
    };

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await reclamationSchema.validate(values, { abortEarly: false });
      setErrors({});

      const payload = {
        issues: selectedIssues,
        products: selectedProducts,
        barcode: values.barcode || null,
        duration,
        distributor: distributer,
        imageUrl: null,
        details: details || null,
      };

      await axios.post(`${apiUrl}/api/auth/user/seller/complaints`, payload, {
        withCredentials: true,
      });

      setSubmitted(true);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: ComplainSellerErrors = {};
        err.inner.forEach((validationError) => {
          const field = validationError.path as keyof ComplainSellerValues;
          if (field && !fieldErrors[field]) {
            fieldErrors[field] = validationError.message;
          }
        });
        setErrors(fieldErrors);
      } else if (axios.isAxiosError(err)) {
        setSubmitError(
          err.response?.data?.message ??
            "Something went wrong while submitting your complaint. Please try again.",
        );
      } else {
        setSubmitError("Unexpected error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-stone-100 py-12 px-4">
      <div className="mx-auto max-w-xl">
        {submitted ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white shadow-xl rounded-xl p-8 max-w-md text-center">
              <h2 className="text-3xl font-bold animate-text">Thank You!</h2>

              <p className="mt-4 text-gray-600">
                Your complaint has been submitted successfully.
              </p>

              <Link
                to="/"
                onClick={resetForm}
                className="mt-6 inline-block bg-red-600 text-white px-6 py-2 rounded-lg"
              >
                Go Home
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row md:flex-row items-start lg:items-center md:items-center justify-center space-x-5 mb-3">
              <Link to="/" className="text-2xl animate-bounce">
                <FontAwesomeIcon icon={faArrowLeft} />
              </Link>
              <h1 className="text-3xl font-bold text-center text-red-600 mb-2">
                Complain A Product
              </h1>
            </div>
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-stone-200 rounded-2xl p-8 space-y-8"
            >
              {/* Issues */}
              <fieldset>
                <legend className="text-sm font-semibold text-stone-900 mb-1">
                  What's the issue?
                </legend>
                <p className="text-xs text-stone-500 mb-1">
                  Choose up to 2 that apply.
                </p>
                {selectedIssues.length >= MAX_ISSUES && (
                  <p className="text-xs font-medium text-orange-600 mb-3">
                    You've reached the 2-issue limit — uncheck one to pick
                    another.
                  </p>
                )}
                {errors.issues && (
                  <p
                    className="text-xs font-medium text-red-600 mb-3"
                    role="alert"
                  >
                    {errors.issues}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {ISSUES.map((issue) => {
                    const checked = selectedIssues.includes(issue);
                    const disabled =
                      !checked && selectedIssues.length >= MAX_ISSUES;
                    return (
                      <label
                        key={issue}
                        htmlFor={`issue-${issue}`}
                        className={`relative flex items-center rounded-lg border pl-10 pr-3 py-3 text-sm cursor-pointer select-none transition-colors
                      ${
                        checked
                          ? "border-red-600 bg-red-50 text-red-900 font-medium"
                          : "border-stone-200 hover:border-red-400"
                      }
                      ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                    `}
                      >
                        <input
                          id={`issue-${issue}`}
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleIssue(issue)}
                        />
                        <span
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-[5px] border flex items-center justify-center
                        ${
                          checked
                            ? "bg-red-600 border-red-600"
                            : "bg-stone-50 border-stone-300"
                        }
                      `}
                        >
                          {checked && (
                            <Check size={12} className="text-white" />
                          )}
                        </span>
                        {issue}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Product details — reveals once an issue is picked */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-dashed border-stone-200 pt-6 space-y-6">
                    {/* Product picker — boxes like the issues */}
                    <div>
                      <label className="block text-sm font-semibold text-stone-900 mb-2">
                        Which product is this about?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {PRODUCTS.map((product) => {
                          const checked = selectedProducts.includes(product.id);
                          return (
                            <label
                              key={product.id}
                              htmlFor={`product-${product.id}`}
                              className={`relative flex items-center rounded-lg border pl-10 pr-3 py-3 text-sm cursor-pointer select-none transition-colors
                            ${
                              checked
                                ? "border-red-600 bg-red-50 text-red-900 font-medium"
                                : "border-stone-200 hover:border-red-400"
                            }
                          `}
                            >
                              <input
                                id={`product-${product.id}`}
                                type="checkbox"
                                className="sr-only"
                                checked={checked}
                                onChange={() => toggleProduct(product.id)}
                              />
                              <span
                                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-[5px] border flex items-center justify-center
                              ${
                                checked
                                  ? "bg-red-600 border-red-600"
                                  : "bg-stone-50 border-stone-300"
                              }
                            `}
                              >
                                {checked && (
                                  <Check size={12} className="text-white" />
                                )}
                              </span>
                              {product.name}
                            </label>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={selectAllProducts}
                        className="mt-2 text-sm font-medium text-red-700 hover:text-red-900 border border-red-200 hover:border-red-400 bg-red-50 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        {allProductsSelected
                          ? "Unselect all products"
                          : "Select all products"}
                      </button>
                      {errors.products && (
                        <p
                          className="mt-2 text-xs font-medium text-red-600"
                          role="alert"
                        >
                          {errors.products}
                        </p>
                      )}
                    </div>

                    {/* Barcode — only once a product is selected */}
                    {selectedProducts.length == 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-stone-900 mb-2">
                          Product barcode
                        </label>
                        <div className="flex gap-2">
                          {digits.map((d, idx) => (
                            <input
                              key={idx}
                              id={`barcode-${idx}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={d}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleDigitChange(idx, e.target.value)
                              }
                              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                                handleDigitKeyDown(idx, e)
                              }
                              onPaste={handleDigitPaste}
                              aria-label={`Barcode digit ${idx + 1}`}
                              className={`aspect-square w-full text-center font-mono text-lg font-semibold rounded-lg border outline-none transition-colors
                            ${d ? "border-red-600 bg-white" : "border-stone-300 bg-stone-50"}
                            ${errors.barcode ? "border-red-600" : ""}
                            focus:border-red-600 focus:ring-2 focus:ring-red-100
                          `}
                            />
                          ))}
                        </div>
                        {errors.barcode && (
                          <p
                            className="mt-2 text-xs font-medium text-red-600"
                            role="alert"
                          >
                            {errors.barcode}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Duration */}
                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-semibold text-stone-900 mb-2"
                      >
                        How long have you had this product?
                      </label>
                      <div className="relative">
                        <SelectForm
                          options={DURATIONS}
                          value={duration}
                          onValueChange={(value) => {
                            setDuration(value);
                            setErrors((prev) => ({
                              ...prev,
                              duration: undefined,
                            }));
                          }}
                        />
                      </div>
                      {errors.duration && (
                        <p
                          className="mt-2 text-xs font-medium text-red-600"
                          role="alert"
                        >
                          {errors.duration}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact details */}
              <fieldset className="space-y-4">
                <div>
                  <legend className="text-sm font-semibold text-stone-900 mb-1">
                    From whom did you buy the product?
                  </legend>
                </div>
                <SelectForm
                  options={DISTRIBUTER}
                  value={distributer}
                  onValueChange={(value) => {
                    setDistributer(value);
                    setErrors((prev) => ({ ...prev, distributer: undefined }));
                  }}
                />
                {errors.distributer && (
                  <p className="text-xs font-medium text-red-600" role="alert">
                    {errors.distributer}
                  </p>
                )}
                <div>
                  <label
                    htmlFor="productImage"
                    className="font-medium cursor-pointer"
                  >
                    Upload Product Image <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="file"
                    className={`w-full mt-2 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 file:mr-4 file:rounded-md file:border-0 file:bg-red-500 file:px-4 file:py-2 file:text-white hover:file:bg-red-600 ${
                      errors.image ? "border-red-600" : ""
                    }`}
                    accept="image/*"
                    onChange={(e) => {
                      handleImageChange(e);
                    }}
                  />
                  {errors.image && (
                    <p
                      className="mt-2 text-xs font-medium text-red-600"
                      role="alert"
                    >
                      {errors.image}
                    </p>
                  )}

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
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">
                    Tell us more (optional)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                      setDetails(e.target.value);
                      setErrors((prev) => ({ ...prev, details: undefined }));
                    }}
                    placeholder="Anything else we should know?"
                    rows={3}
                    className={`w-full rounded-lg border bg-stone-50 text-sm px-3 py-2.5 outline-none resize-y focus:border-red-600 focus:ring-2 focus:ring-red-100 ${
                      errors.details ? "border-red-600" : "border-stone-300"
                    }`}
                  />
                  {errors.details && (
                    <p
                      className="mt-2 text-xs font-medium text-red-600"
                      role="alert"
                    >
                      {errors.details}
                    </p>
                  )}
                </div>
              </fieldset>

              {/* Submit */}
              {submitError && (
                <p
                  className="text-sm font-medium text-red-600 text-center"
                  role="alert"
                >
                  {submitError}
                </p>
              )}
              <div className="flex items-center justify-center gap-4 pt-2">
                <Link
                  to="/"
                  className="border-gray-300 border px-6 py-3 rounded-lg flex items-center gap-2  hover:opacity-70 transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-700 cursor-pointer hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-6 py-3 transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit complaint"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
