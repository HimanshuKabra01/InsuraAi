import React from "react";
import { motion } from "framer-motion";
import { UserPlus, UploadCloud, Coffee } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Create Account",
    desc: "Sign up in seconds. No credit card required for the free tier.",
    icon: <UserPlus className="w-6 h-6 text-white" />,
  },
  {
    id: 2,
    title: "Upload Policies",
    desc: "Drag & drop your documents. Our AI extracts the details automatically.",
    icon: <UploadCloud className="w-6 h-6 text-white" />,
  },
  {
    id: 3,
    title: "Relax & Save",
    desc: "We track the dates. You get peace of mind and timely reminders.",
    icon: <Coffee className="w-6 h-6 text-white" />,
  },
];

export default function HowItWorks() {
  return (
    // Updated Section Background: Using a subtle gradient to match Hero theme
    <section id="how" className="py-24 px-6 bg-gradient-to-tr from-purple-50 via-white to-indigo-50 relative overflow-hidden">
      
      {/* --- Background Floating Blobs (Synced with Hero style) --- */}
      {/* Bottom-left purple blob */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -50 }}
        whileInView={{ opacity: 0.3, scale: 1, x: 0 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-purple-200 rounded-full blur-3xl opacity-30 pointer-events-none z-0"
      />
      {/* Top-right indigo blob */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 50 }}
        whileInView={{ opacity: 0.3, scale: 1, x: 0 }}
        transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-indigo-200 rounded-full blur-3xl opacity-30 pointer-events-none z-0"
      />

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold mb-4">
            Simple Process
          </span>
          <h3 className="text-4xl font-extrabold text-gray-900 mb-4">
            From Chaos to Clarity in 3 Steps
          </h3>
          <p className="text-gray-600 text-lg">
            Stop digging through filing cabinets. Let InsuraAI handle the boring stuff.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Visual Connector Line (Desktop Only) */}
          {/* Updated border color to blend with new background */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-indigo-300/60 z-0" />

          {steps.map((step, index) => (
            <StepItem key={step.id} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Internal Sub-Component for individual Steps (No changes here) --- */
function StepItem({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="relative flex flex-col items-center text-center z-10 group"
    >
      {/* Icon Circle with Pulse Effect */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border border-indigo-50 relative z-10 group-hover:scale-110 transition-transform duration-300">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            {step.icon}
          </div>
        </div>
        
        {/* Step Number Badge */}
        <div className="absolute top-0 right-0 bg-gray-900 text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full border-4 border-white z-20 shadow-md">
          {step.id}
        </div>
      </div>

      {/* Content */}
      <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
        {step.title}
      </h4>
      <p className="text-gray-600 leading-relaxed max-w-xs">
        {step.desc}
      </p>
    </motion.div>
  );
}