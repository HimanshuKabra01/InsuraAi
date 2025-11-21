import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* --- Desktop & Tablet Navbar --- */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed z-50 left-0 right-0 flex justify-center transition-all duration-500 ease-in-out ${
          scrolled ? "top-4" : "top-0"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 ease-out ${
            scrolled
              ? "w-[95%] md:w-[850px] bg-white/90 backdrop-blur-md shadow-xl rounded-full border border-gray-200 py-2 pl-6 pr-2"
              : "w-full bg-white py-5 px-8 border-b border-gray-100"
          }`}
        >
          {/* Logo - Strictly Black & White */}
          <Link to="/" className="flex items-center gap-2 z-50 mr-8">
            <span className="text-xl font-bold tracking-tight text-black">
              Insura<span className="text-gray-500">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav
            className="hidden md:flex items-center gap-1 flex-1 justify-center"
            onMouseLeave={() => setHoveredTab(null)}
          >
            {["Features", "How it Works", "Testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, "")}`}
                onMouseEnter={() => setHoveredTab(item)}
                className="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                {hoveredTab === item && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-gray-100 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item}
              </a>
            ))}
          </nav>

          {/* Actions - B&W Segmented Control */}
          <div className="hidden md:flex items-center">
            <div className={`flex items-center overflow-hidden border border-gray-300 shadow-sm transition-all ${scrolled ? 'rounded-full' : 'rounded-lg'}`}>
              <Link
                to="/login"
                className="px-6 py-2.5 text-sm font-semibold text-black bg-white hover:bg-gray-50 transition-colors border-r border-gray-300"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-black hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-black rounded-full hover:bg-gray-100 transition ml-auto"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* --- Mobile Full Screen Menu (Black & White) --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-white flex flex-col justify-center items-center"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <X className="w-6 h-6 text-black" />
            </button>

            <nav className="flex flex-col space-y-6 text-center">
              {["Features", "How it Works", "Testimonials", "Contact"].map(
                (item, idx) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s/g, "")}`}
                    onClick={() => setMobileMenuOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    className="text-3xl font-bold text-black hover:text-gray-500 transition-colors tracking-tight"
                  >
                    {item}
                  </motion.a>
                )
              )}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-col gap-4 w-64"
            >
              <div className="flex rounded-xl overflow-hidden border border-gray-300 shadow-lg w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 py-3 text-center bg-white text-black font-semibold hover:bg-gray-50 border-r border-gray-300"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 py-3 text-center bg-black text-white font-semibold hover:bg-gray-800"
                >
                  Sign up
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}