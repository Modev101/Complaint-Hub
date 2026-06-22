import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function FeatureCard() {
  const [clicked, setClicked] = useState(false);
  const { userCode } = useAuth();

  return (
    <>
      <section className="max-w-7xl lg:h-[80vh] mx-auto px-6 py-20 flex flex-col lg:flex-row items-center">
        <div className="flex-1">
          <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-sm flex items-center justify-center lg:inline-block">
            Complaint Management Platform
          </span>

          <h2 className="text-5xl text-center lg:text-left font-bold mt-6 leading-tight">
            Your Voice <span className="text-red-600">Matters.</span>
          </h2>

          <p className="text-gray-600 mt-6 text-lg text-center lg:text-left">
            Report complaints, track their progress, and receive timely
            resolutions. Our platform connects citizens and organizations in a
            transparent and efficient way.
          </p>

          <div className="mt-8 flex flex-col lg:items-start items-center gap-4">
            <button
              onClick={() => setClicked((prev) => !prev)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-70 transition cursor-pointer"
            >
              Complain
            </button>
            <div className="flex gap-5">
              {clicked && (
                <>
                  <Link
                    to={userCode ? "/user/seller/complaints" : "/login"}
                    className="border-gray-300 border px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-red-600 hover:text-white transition"
                  >
                    Seller
                  </Link>

                  <Link
                    to="/user/consumer/complaints"
                    className="border-gray-300 border px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-red-600 hover:text-white transition"
                  >
                    Consumer
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 mt-12 lg:mt-0 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700"
            alt="Complaint Service"
            className="rounded-2xl shadow-xl"
          />
        </div>
      </section>
    </>
  );
}
