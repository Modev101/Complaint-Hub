import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto flex flex-col md:flex-row lg:flex-row items-center justify-between px-6 py-4">
        <Link to="/">
          <p className="text-2xl font-bold text-red-600">ComplaintHub</p>
        </Link>
      </nav>
    </header>
  );
}
