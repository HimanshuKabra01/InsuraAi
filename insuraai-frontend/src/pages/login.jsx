import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Navbar from "../components/Navbar";

export default function Login() {
  const navigate = useNavigate(); // Initialize hook
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Dynamically load GSI script if not present
    if (typeof window !== "undefined" && !window.google) {
      const existing = document.getElementById("google-client-script");
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.id = "google-client-script";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initGsi();
        };
        document.body.appendChild(script);
      } else {
        scriptOnLoadInit();
      }
    } else {
      initGsi();
    }

    function scriptOnLoadInit() {
      // fallback if script exists already
      try {
        initGsi();
      } catch (e) {
        // ignore
      }
    }

    function initGsi() {
      if (!window.google || !GOOGLE_CLIENT_ID) return;
      // initialize GSI with callback (popup UX)
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        ux_mode: "popup",
      });

      // render the official GSI button into a hidden container
      const container = document.getElementById("google-render");
      if (container) {
        // Render the official button (we'll hide it and trigger programmatically)
        window.google.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          type: "standard",
        });
        // keep it visually hidden but in the DOM
        container.style.display = "none";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Safety Check: Ensure API URL is defined
    if (!API_URL) {
      setMessage("error: API URL is missing in .env file");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting login to:", `${API_URL}/api/auth/login`); // Debug log

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage("success");

        // Use navigate instead of window.location.href
        setTimeout(() => {
          navigate("/Dashboard");
        }, 800);
      } else {
        setMessage("error: " + (data.error || "Invalid credentials"));
      }
    } catch (error) {
      console.error("Login Error Details:", error); // Log the actual error
      setMessage("error: Connection failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // Called by GSI after successful Google sign-in; receives id_token in response.credential
  async function handleCredentialResponse(response) {
    if (!response?.credential) {
      console.error("No credential returned by Google");
      return;
    }
    setLoadingGoogle(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage("success");
        setTimeout(() => {
          navigate("/Dashboard");
        }, 700);
      } else {
        setMessage("error: " + (data.error || "Google sign-in failed"));
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setMessage("error: Google sign-in failed");
    } finally {
      setLoadingGoogle(false);
    }
  }

  // When user clicks our styled Google button, trigger the hidden GSI button (user-initiated click)
  function triggerGooglePopup() {
    // If GSI not loaded, inform user
    if (!window.google) {
      setMessage("error: Google SDK not loaded");
      return;
    }
    // The official button is rendered into #google-render; click it programmatically
    const btn = document.querySelector("#google-render button, #google-render div[role='button']");
    if (btn) {
      btn.click();
    } else {
      // fallback: prompt one-tap (may show)
      try {
        window.google.accounts.id.prompt();
      } catch (e) {
        setMessage("error: Google prompt failed");
      }
    }
  }

  return (
    <>
      <Navbar />

      <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden pt-20">
        {/* Minimalist Grid Background */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        ></div>

        {/* Background Glow (Subtle) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-100 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -z-10" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="relative w-full max-w-md px-6">
          {/* Card Container */}
          <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white mb-4 shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-2">Please enter your details to sign in.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transition-all ${loading ? "opacity-80 cursor-not-allowed" : ""}`}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Google Sign-in Button */}
            <div className="mt-4">
              <button
                onClick={triggerGooglePopup}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                disabled={loadingGoogle}
              >
                {/* Google SVG logo */}
                <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                  <path d="M533.5 278.4c0-18.8-1.6-37-4.7-54.6H272v103.1h147.3c-6.4 34.6-25.8 63.9-55 83.5v69.3h88.8c52-48 81.4-118.4 81.4-201.3z" fill="#4285F4"/>
                  <path d="M272 544.3c73 0 134.3-24.1 179.1-65.4l-88.8-69.3c-24.7 16.6-56.5 26.3-90.3 26.3-69 0-127.4-46.6-148.4-109.2H34.4v68.6C78.3 485.9 167 544.3 272 544.3z" fill="#34A853"/>
                  <path d="M123.6 330.6c-10.8-31.2-10.8-64.9 0-96.1V166l-88.6-68.6C7 173.9 7 370.4 35.1 444.3l88.5-68.7z" fill="#FBBC04"/>
                  <path d="M272 107.6c38.5-.6 73 13.6 100.2 39.5l75-75C406 24.9 343.6 0 272 0 167 0 78.3 58.4 34.4 166l88.6 68.6C144.6 154.3 203 107.6 272 107.6z" fill="#EA4335"/>
                </svg>
                {loadingGoogle ? "Signing in with Google..." : "Sign in with Google"}
              </button>
              {/* hidden container where official GSI button is rendered */}
              <div id="google-render" aria-hidden="true" style={{ display: "none" }} />
            </div>

            {/* Status Messages */}
            {message && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${message === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {message === "success" ? "Login successful! Redirecting..." : message}
              </motion.div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don’t have an account?{" "}
                <a href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Sign up for free
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
