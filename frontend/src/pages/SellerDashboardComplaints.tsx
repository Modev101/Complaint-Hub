import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
type Complaint = {
  id: string;
  issues: string[];
  products: string[];
  distributor: string;
  duration: string;
  details: string | null;
  imageUrl: string | null;
  createdAt: string;
  user: {
    storeName: string;
    phoneNumber: string;
    state: string;
    county: string;
    town: string;
    platform: string;
  };
};

export default function ConsumerDashboardComplaints() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/api/auth/admin/seller/complaints`,
          {
            withCredentials: true, // if using cookie auth
          },
        );

        setComplaints(response.data.complaints);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };

    fetchComplaints();
  }, [apiUrl]);

  return (
    <>
      <div className="flex items-center justify-center space-x-4 my-5">
        <Link to="/admin/dashboard">
          <ArrowLeft className="animate-bounce size-10" />
        </Link>

        <h1 className="text-red-600 text-4xl font-semibold">
          Seller Dashboard Complaints
        </h1>
      </div>

      {complaints.length === 0 ? (
        <>
          {" "}
          <div className="flex flex-col space-y-5 justify-center items-center min-h-[70vh]">
            <p className="font-semibold text-2xl">No complaints found</p>
            <Loader2 className="animate-spin size-16 text-red-500 mx-auto mb-6" />
          </div>
        </>
      ) : (
        complaints.map((complaint: Complaint) => (
          <div
            key={complaint.id}
            className="border p-4 rounded mb-4 flex flex-col items-center justify-center"
          >
            <h2>{complaint.user.storeName}</h2>

            <p>
              <strong>Phone:</strong> {complaint.user.phoneNumber}
            </p>

            <p>
              <strong>State:</strong> {complaint.user.state}
            </p>

            <p>
              <strong>County:</strong> {complaint.user.county}
            </p>

            <p>
              <strong>Town:</strong> {complaint.user.town}
            </p>

            <p>
              <strong>Platform:</strong> {complaint.user.platform}
            </p>

            <p>
              <strong>Issues:</strong> {complaint.issues.join(", ")}
            </p>

            <p>
              <strong>Products:</strong> {complaint.products.join(", ")}
            </p>

            <p>
              <strong>Distributor:</strong> {complaint.distributor}
            </p>

            <p>
              <strong>Duration:</strong> {complaint.duration}
            </p>

            <p>
              <strong>Details:</strong> {complaint.details || "None"}
            </p>

            {complaint.imageUrl && (
              <img
                src={complaint.imageUrl}
                alt="Complaint"
                className="w-40 mt-2"
              />
            )}

            <small>
              Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
            </small>
          </div>
        ))
      )}
    </>
  );
}
