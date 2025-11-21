import React from "react";
import { motion } from "framer-motion";

export function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white shadow-md rounded-2xl p-6 text-center"
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{desc}</p>
    </motion.div>
  );
}

export function StepCard({ step, title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-50 rounded-2xl shadow-md p-6 text-center"
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{desc}</p>
    </motion.div>
  );
}

export function TestimonialCard({ feedback, name, role, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-6 text-left transition-all cursor-pointer"
    >
      <p className="text-gray-700 italic mb-4">“{feedback}”</p>
      <h4 className="font-semibold text-indigo-700">{name}</h4>
      <p className="text-gray-500 text-sm">{role}</p>
    </motion.div>
  );
}