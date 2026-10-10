import { Link } from "react-router-dom";

function Navbar() {
    return (
        <div className="w-full bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-center items-center gap-40 py-5">
                <Link
                    to="/"
                    className="text-lg font-semibold text-gray-700 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 transition duration-200"
                >
                    Home
                </Link>

                <Link
                    to="/about"
                    className="text-lg font-semibold text-gray-700 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 transition duration-200"
                >
                    About Us
                </Link>
            </div>
        </div>
    );
}

export default Navbar;