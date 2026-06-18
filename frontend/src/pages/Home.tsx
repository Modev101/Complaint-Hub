import React from "react";
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";

const Home: React.FC = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <FeatureCard user={user} />

      <Footer />
    </div>
  );
};

export default Home;
