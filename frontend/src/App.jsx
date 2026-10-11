import { Routes, Route } from "react-router";
import Navbar from "./Navigatiaon/Nav_bar";
import LandingPage from "./pages/Landing_page";
import Home_page from "./pages/Home_page";
import About from "./pages/About_page";
import NotFoundPage from "./pages/NotFound_page";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Home_page />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
