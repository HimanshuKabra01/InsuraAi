import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Bell, BarChart3, Zap, ArrowRight } from "lucide-react";

// --- Feature Data ---
const features = [
  {
    id: 1,
    title: "Bank-Grade Security",
    desc: "Your policies are encrypted with AES-256 bit security. We keep your sensitive data safe in a digital vault.",
    icon: ShieldCheck,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    delay: 0.1,
  },
  {
    id: 2,
    title: "Smart Reminders",
    desc: "Never pay a late fee again. Our AI predicts renewal dates and nudges you via WhatsApp or SMS.",
    icon: Bell,
    color: "text-purple-600", 
    bg: "bg-purple-50",
    delay: 0.2,
  },
  {
    id: 3,
    title: "1-Click Renewals",
    desc: "Connect your provider once and renew policies instantly without re-entering your details.",
    icon: Zap,
    color: "text-blue-600", 
    bg: "bg-blue-50",
    delay: 0.3,
  },
  {
    id: 4,
    title: "Spend Analytics",
    desc: "Visualize your insurance spending over time. Identify gaps in coverage and opportunities to save.",
    icon: BarChart3,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    delay: 0.4,
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 px-6 bg-white overflow-hidden font-['Outfit',_sans-serif]">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>

      
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-[-100px] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none"
      />

      {/* --- Main Content --- */}
      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-indigo-600 font-semibold tracking-wide uppercase text-xs md:text-sm bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100"
          >
            Why Choose InsuraAI
          </motion.span>
          
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-slate-900 mt-6 mb-4 leading-tight"
          >
            Everything you need to <br />
            <span className="text-indigo-600">stay protected.</span>
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500"
          >
            Manage your life's coverage without the paperwork chaos. 
            Simple, secure, and smart.
          </motion.p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Individual Card Component ---
function FeatureCard({ feature }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: feature.delay }}
      whileHover={{ y: -5 }}
      className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col h-full"
    >
      {/* Icon Container */}
      <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <feature.icon size={28} strokeWidth={2} />
      </div>

      {/* Text Content */}
      <div className="flex-grow">
        <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
          {feature.title}
        </h4>
        <p className="text-slate-500 leading-relaxed text-sm">
          {feature.desc}
        </p>
      </div>

      {/* Decorative Hover Arrow */}
      <div className="mt-6 flex items-center text-indigo-600 text-sm font-semibold opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        Learn more <ArrowRight size={16} className="ml-2" />
      </div>
      
      {/* Subtle Gradient Border Effect on Hover */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-indigo-50 pointer-events-none transition-colors duration-300" />
    </motion.div>
  );
}