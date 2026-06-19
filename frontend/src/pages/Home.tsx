import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";
import type { AuthResponse } from "../types/index.ts";


export default function Home({ user }: { user: AuthResponse | null }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <FeatureCard user={user} />

      <Footer />
    </div>
  );
}
