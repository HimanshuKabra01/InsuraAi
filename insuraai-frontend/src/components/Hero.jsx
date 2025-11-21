import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// Ensure the path to your image is correct based on folder structure
import insuranceImg from "../assets/20943832.jpg"; 

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Background floating gradient shapes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-10 left-[-100px] w-96 h-96 bg-indigo-300 rounded-full blur-3xl opacity-30"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.8, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-10 right-[-120px] w-[500px] h-[500px] bg-purple-300 rounded-full blur-3xl opacity-30"
      />

      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 text-center md:text-left"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Never miss
            </span>{" "}
            your insurance renewal again.
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto md:mx-0">
            InsuraAI helps you track, manage, and auto-renew your policies with 
            smart reminders, AI-powered extraction, and real-time analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/signup"
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg hover:bg-indigo-700 transition"
              >
                Get Started Free
              </Link>
            </motion.div>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#features"
              className="px-8 py-3 border border-indigo-600 text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition"
            >
              Learn More
            </motion.a>
          </div>
        </motion.div>

        {/* Right Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="md:w-1/2 mt-12 md:mt-0 flex justify-center"
        >
           {/* <img
             src={insuranceImg}
             alt="Insurance illustration"
             className="w-[90%] max-w-md"
           /> */}
        </motion.div>
      </div>
    </section>
  );
}