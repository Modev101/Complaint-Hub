import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faUser } from "@fortawesome/free-solid-svg-icons";
import "../App.css";

export default function Seller({ user }) {
  const username = String(user?.user?.name);

  const capitalizedUsername =
    username.charAt(0).toUpperCase() + username.slice(1);
  return (
    <>
      <div className="flex flex-col space-y-3 items-center lg:pt-20 md:pt-20 lg:my-0 md:my-0 my-10">
        <h1 className="text-3xl">
          Hello, <span className="animate-text">{capitalizedUsername}</span>
        </h1>
        <p className="text-xl text-gray-600/80">
          Please select the type <br className="lg:hidden md:hidden" /> you want
          to complain:
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 content-center items-center justify-center min-h-[60vh] mb-10 lg:mb-0 md:mb-0">
        <Link
          to="/user/seller/complaints/product"
          className="rounded-xl border text-center border-gray-200 bg-red-100 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-semibold animate-icon">
            Complain a Product
          </h2>
          <span className="text-red-400 text-6xl">
            <FontAwesomeIcon icon={faBoxOpen} />
          </span>
          <p className="text-gray-600/80">
            Submit a complaint about a product <br /> purchased or used.
          </p>
        </Link>

        <Link
          to="/user/seller/complaints/distributor"
          className="rounded-xl border text-center border-gray-200 bg-red-100 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-semibold animate-icon">
            Complain a Distributor
          </h2>
          <span className="text-red-400 text-6xl">
            <FontAwesomeIcon icon={faUser} />
          </span>
          <p className="text-gray-600/80">
            Submit a complaint about a <br /> distributor or supplier.
          </p>
        </Link>
      </div>
    </>
  );
}
