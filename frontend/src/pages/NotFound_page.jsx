import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="text-center max-w-md">
        <p className="text-6xl font-extrabold text-blue-600 mb-4">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 text-sm sm:text-base">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition duration-200 shadow-sm"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
