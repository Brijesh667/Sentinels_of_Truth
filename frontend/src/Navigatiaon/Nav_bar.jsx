import { NavLink } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

function Navbar() {
  const linkClass = ({ isActive }) =>
    `text-sm md:text-base font-semibold px-3 md:px-4 py-2 rounded-lg transition duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs"
        : "text-gray-700 border border-transparent hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <header className="w-full bg-white/95 backdrop-blur-xs shadow-xs sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-6 py-3.5">
        <div className="flex items-center gap-3 md:gap-6">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold text-gray-900 text-base md:text-lg hover:opacity-90 transition mr-1"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            Sentinels of Truth
          </NavLink>

          <nav className="flex items-center gap-1 md:gap-2">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/app" className={linkClass}>
              Verify
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-semibold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer shadow-xs">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export default Navbar;