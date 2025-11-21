  import React, { useState } from "react";
  import { motion } from "framer-motion";
  import { ShieldCheck } from "lucide-react";

  export default function Signup() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState("");
    const API = import.meta.env.VITE_API_URL;
    const handleChange = (e) =>
      setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setMessage("");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok) setMessage("✅ Signup successful! Please login.");
        else setMessage("❌ " + (data.error || "Signup failed"));
      } catch {
        setMessage("❌ Network error");
      }
    };

    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Floating Background Blobs (same as Login) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[-100px] left-[-150px] w-[400px] h-[400px] bg-indigo-300 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-[-120px] right-[-150px] w-[500px] h-[500px] bg-purple-300 rounded-full blur-3xl"
        />

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md border border-indigo-100"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              initial={{ rotate: -15 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <ShieldCheck className="w-12 h-12 text-indigo-600 mb-3" />
            </motion.div>
            <h2 className="text-4xl font-extrabold text-indigo-600 tracking-tight">
              Welcome to InsuraAI
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Create your account to get started 🚀
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="password"
              name="password"
              placeholder="Password"
              className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#4f46e5" }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow-lg transition duration-200 hover:shadow-xl"
            >
              Signup
            </motion.button>
          </form>

          {/* Message */}
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-sm text-gray-700"
            >
              {message}
            </motion.p>
          )}

          {/* Redirect */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-indigo-600 font-medium hover:underline hover:text-indigo-800 transition"
            >
              Login
            </a>
          </p>
        </motion.div>
      </div>
    );
  }
