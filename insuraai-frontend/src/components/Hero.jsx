import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Shield } from "lucide-react";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 px-6 bg-white font-['Outfit',_sans-serif]">
      {/* Import Font dynamically */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      {/* --- Background Elements --- */}
      <div className="absolute inset-0 z-0 opacity-40" 
           style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>

      <motion.div
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px]"
      />
      
      {/* --- Main Content --- */}
      <div className="container mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center flex flex-col items-center"
        >
          
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm text-indigo-600 text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v2.0 Now Live: Auto-Policy Import
          </motion.div>

          {/* Headline */}
          <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none mb-6 text-slate-900">
            Stop worrying about <br />
            your insurance{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                renewal
              </span>
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-200 z-0" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
            .
          </motion.h2>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-xl text-slate-500 mb-8 max-w-2xl mx-auto leading-normal font-normal">
            Centralize all your policies in one secure dashboard. We use AI to track dates, compare rates, and ensure you're never uninsured.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 w-full mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/signup"
                  className="group flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-600 transition-all"
                >
                  Start Tracking Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#how-it-works"
                className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-medium text-lg hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                See How It Works
              </motion.a>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1"><Check size={12} /> No credit card required</span>
              <span className="flex items-center gap-1"><Check size={12} /> Cancel anytime</span>
            </div>
          </motion.div>

          {/* --- Trusted By Section --- */}
          <motion.div variants={itemVariants} className="w-full max-w-4xl mx-auto">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-6">
              Trusted by 10,000+ Users & Works with
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 opacity-60">
               {['Allianz', 'AXA', 'MetLife', 'Prudential', 'Zurich'].map((brand) => (
                 <span key={brand} className="text-lg md:text-xl font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-default flex items-center gap-2">
                   <Shield size={18} className="fill-current" /> {brand}
                 </span>
               ))}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}