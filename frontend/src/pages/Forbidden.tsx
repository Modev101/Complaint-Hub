import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-bold text-red-600">403</h1>

      <h2 className="mt-4 text-2xl font-semibold">Access Forbidden</h2>

      <p className="mt-2 text-gray-600 max-w-md">
        You don't have permission to access this page.
      </p>

      <Link
        to="/"
        className="mt-6 px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
