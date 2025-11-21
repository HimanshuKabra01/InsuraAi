import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldCheck, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* --- Desktop & Tablet Navbar --- */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed z-50 transition-all duration-500 ease-in-out left-0 right-0 flex justify-center ${
          scrolled ? "top-4" : "top-0"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 ease-out ${
            scrolled
              ? "w-[90%] md:w-[700px] bg-white/70 backdrop-blur-xl shadow-2xl rounded-full border border-white/40 py-3 px-6"
              : "w-full bg-transparent py-6 px-8"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 z-50">

            <span
              className={`text-xl font-bold tracking-tight transition-colors ${
                scrolled ? "text-gray-900" : "text-gray-900"
              }`}
            >
              Insura<span className="text-indigo-600">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav
            className="hidden md:flex items-center gap-1"
            onMouseLeave={() => setHoveredTab(null)}
          >
            {["Features", "How it Works", "Testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, "")}`}
                onMouseEnter={() => setHoveredTab(item)}
                className="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-900 transition-colors"
              >
                {hoveredTab === item && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-gray-100/80 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="group relative px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full overflow-hidden shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-1">
                Get Started <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-800 rounded-full hover:bg-gray-100 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* --- Mobile Full Screen Menu --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-2xl flex flex-col justify-center items-center"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <X className="w-6 h-6 text-gray-900" />
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
                    className="text-3xl font-bold text-gray-900 hover:text-indigo-600 transition-colors tracking-tight"
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
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-900 font-semibold text-center hover:bg-gray-200 transition"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-center shadow-xl hover:bg-indigo-700 transition"
              >
                Get Started Free
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}