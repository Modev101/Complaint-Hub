import { faBoxOpen, faStore } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 mt-10 md:grid-cols-2 content-center items-center justify-center min-h-[60vh] mb-10 lg:mb-0 md:mb-0">
        <Link
          to="/seller/complaints"
          className="rounded-xl border text-center border-gray-200 bg-red-100 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-semibold animate-icon">
            Seller Complaints
          </h2>
          <span className="text-red-400 text-6xl">
            <FontAwesomeIcon icon={faStore} />
          </span>
        </Link>
        <Link
          to="/consumer/complaints/"
          className="rounded-xl border text-center border-gray-200 bg-red-100 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-semibold animate-icon">
            Consumer Complaints
          </h2>
          <span className="text-red-400 text-6xl">
            <FontAwesomeIcon icon={faBoxOpen} />
          </span>
        </Link>
      </div>
    </>
  );
}
