import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  console.log("Backend URL →", import.meta.env.VITE_API_URL);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),X
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage("✅ Login successful!");
        window.location.href = "/Dashboard";
      } else {
        setMessage("❌ " + (data.error || "Login failed"));
      }
    } catch {
      setMessage("❌ Network error");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Floating Gradient Backgrounds */}
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

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md border border-indigo-100"
      >
        {/* Logo / Title */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ rotate: -15 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <ShieldCheck className="w-12 h-12 text-indigo-600 mb-3" />
          </motion.div>
          <h2 className="text-4xl font-extrabold text-indigo-600 tracking-tight">
            Welcome Back!
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Sign in to continue your journey with{" "}
            <span className="font-semibold text-indigo-500">InsuraAI</span> 🔐
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            name="email"
            placeholder="Email address"
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
            className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
            Login
          </motion.button>
        </form>

        {/* Status Message */}
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-gray-700"
          >
            {message}
          </motion.p>
        )}

        {/* Signup Redirect */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-indigo-600 font-medium hover:underline hover:text-indigo-800 transition"
          >
            Signup
          </a>
        </p>
      </motion.div>
    </div>
  );
}
