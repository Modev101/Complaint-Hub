import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeButton";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/">
          <p className="text-2xl font-bold text-red-600">ComplaintHub</p>
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
