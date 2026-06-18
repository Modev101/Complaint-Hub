import { AlertTriangle, ShieldCheck, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function FeatureCard({ user }) {
  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center">
        <div className="flex-1">
          <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-sm">
            Complaint Management Platform
          </span>

          <h2 className="text-5xl font-bold mt-6 leading-tight">
            Your Voice <span className="text-red-600">Matters.</span>
          </h2>

          <p className="text-gray-600 mt-6 text-lg">
            Report complaints, track their progress, and receive timely
            resolutions. Our platform connects citizens and organizations in a
            transparent and efficient way.
          </p>

          <div className="mt-8 flex gap-4">
            {!user && (
              <>
                <Link
                  to="/register"
                  className="bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/login"
                  className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                  Login
                </Link>
              </>
            )}
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

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-12">
            Why Choose Us?
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl shadow hover:shadow-lg transition">
              <AlertTriangle className="text-red-600 mb-4" size={45} />

              <h4 className="font-bold text-xl mb-3">
                Easy Complaint Submission
              </h4>

              <p className="text-gray-600">
                Submit complaints in minutes with our intuitive and secure
                online platform.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl shadow hover:shadow-lg transition">
              <ShieldCheck className="text-green-600 mb-4" size={45} />

              <h4 className="font-bold text-xl mb-3">Secure & Transparent</h4>

              <p className="text-gray-600">
                Your information is protected while allowing transparent case
                tracking.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl shadow hover:shadow-lg transition">
              <Users className="text-blue-600 mb-4" size={45} />

              <h4 className="font-bold text-xl mb-3">Dedicated Support</h4>

              <p className="text-gray-600">
                Our team ensures every complaint reaches the right department
                for faster resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h3 className="text-4xl font-bold">
            Building Trust Through Transparency
          </h3>

          <p className="mt-6 mb-8 text-lg text-red-100">
            ComplaintHub empowers customers and organizations by providing an
            efficient complaint management system that promotes accountability,
            transparency, and faster issue resolution.
          </p>
          {!user && (
            <Link
              to="/register"
              className="mt-8 bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Join Now
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
