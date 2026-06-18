export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <>
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p>© {year} ComplaintHub. All rights reserved.</p>

          <div className="space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">
              Privacy
            </a>

            <a href="#" className="hover:text-white">
              Terms
            </a>

            <a href="#" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
