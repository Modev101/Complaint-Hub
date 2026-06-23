import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Complaint = {
  id: string;
  companyName: string;
  companyProduct: string;
  state: string;
  county: string;
  town: string;
  details: string;
  name: string;
  phoneNumber: string;
  email: string;
  imageUrl: string | null;
  createdAt: string;
};

export default function ConsumerDashboardComplaints() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/api/auth/admin/consumer/complaints`,
          {
            withCredentials: true,
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
          <ArrowLeft className="animate-bounce lg:size-10 md:size-10" />
        </Link>

        <h1 className="text-red-600 lg:text-4xl md:text-4xl font-semibold">
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
        complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="border p-4 rounded mb-4 flex flex-col items-center justify-center"
          >
            <h2>
              <strong>Store Name:</strong>
              {complaint.name}
            </h2>

            <p>
              <strong>Company:</strong> {complaint.companyName}
            </p>

            <p>
              <strong>Product:</strong> {complaint.companyProduct}
            </p>

            <p>
              <strong>Phone:</strong> {complaint.phoneNumber}
            </p>

            <p>
              <strong>Email:</strong> {complaint.email}
            </p>

            <p>
              <strong>State:</strong> {complaint.state}
            </p>

            <p>
              <strong>County:</strong> {complaint.county}
            </p>

            <p>
              <strong>Town:</strong> {complaint.town}
            </p>

            <p>
              <strong>Details:</strong>{" "}
              <span className="break-all">{complaint.details || "None"}</span>
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
