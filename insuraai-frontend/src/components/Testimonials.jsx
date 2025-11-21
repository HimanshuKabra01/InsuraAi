import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

// Mock Data with Avatars
const testimonials = [
  {
    id: 1,
    name: "Sneha Nair",
    role: "Freelance Designer, Kochi",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    content:
      "I used to lose track of my car insurance every single year. InsuraAI's dashboard is so clean, I actually enjoy checking my policies now.",
    rating: 5,
  },
  {
    id: 2,
    name: "Rahul Mehta",
    role: "Software Engineer, Mumbai",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    content:
      "The auto-renewal feature is a lifesaver. I saved nearly ₹5,000 because I didn't let my policy lapse this time. Highly recommended!",
    rating: 5,
  },
  {
    id: 3,
    name: "Ananya Verma",
    role: "Startup Founder, Delhi",
    image: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    content:
      "Uploading a PDF and having the AI pull out the dates and premiums instantly? Pure magic. It saves me hours of manual entry.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 bg-white overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: "radial-gradient(#4f46e5 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
      </div>
      
      {/* Gradient Overlay for bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-0"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h3 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm mb-3">
            Community Love
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Trusted by thousands of policyholders.
          </h2>
          
          <p className="text-lg text-gray-600">
            Don't just take our word for it. Here is what professionals across the country are saying about InsuraAI.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.id} data={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Enhanced Card Component --- */
function TestimonialCard({ data, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      whileHover={{ y: -5 }}
      className="bg-white border border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative flex flex-col h-full"
    >
      {/* Decorative Big Quote Icon */}
      <Quote className="absolute top-6 right-6 w-12 h-12 text-indigo-50 fill-current" />

      {/* Star Ratings */}
      <div className="flex space-x-1 mb-6">
        {[...Array(data.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-700 leading-relaxed text-lg mb-8 flex-grow relative z-10">
        "{data.content}"
      </p>

      {/* User Info */}
      <div className="flex items-center mt-auto border-t border-gray-100 pt-6">
        <img
          src={data.image}
          alt={data.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 mr-4"
        />
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{data.name}</h4>
          <p className="text-indigo-600 text-xs font-medium">{data.role}</p>
        </div>
      </div>
    </motion.div>
  );
} 