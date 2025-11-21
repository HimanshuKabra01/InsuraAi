import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed w-full bg-white shadow-sm z-50">
      <nav className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Left - Brand */}
        <h1 className="text-2xl font-bold text-indigo-600">InsuraAI</h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4 px-2 font-medium items-center">
          <a href="#features" className="hover:text-indigo-600">Features</a>
          <a href="#how" className="hover:text-indigo-600">How It Works</a>
          <a href="#testimonials" className="hover:text-indigo-600">Testimonials</a>
          <a href="#contact" className="hover:text-indigo-600">Contact</a>

          {/* SPA Links */}
          <Link
            to="/login"
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition"
          >
            Signup
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-indigo-600 focus:outline-none"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="md:hidden bg-white border-t shadow-md"
        >
          <div className="flex flex-col items-center space-y-3 py-4 font-medium">
            <a href="#features" className="hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" className="hover:text-indigo-600" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#testimonials" className="hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Testimonials</a>
            <a href="#contact" className="hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Contact</a>

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition w-32 text-center"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition w-32 text-center"
            >
              Signup
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}