import { Outlet } from "react-router-dom";
import Navbar from "../Navigatiaon/Nav_bar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg text-fg transition-colors duration-200">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-fg focus:rounded-xl focus:shadow-lg focus:outline-hidden"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
