import React from "react";
import { TestimonialCard } from "./UIComponents";

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-indigo-50 py-20 px-6">
      <div className="container mx-auto text-center mb-12">
        <h3 className="text-3xl font-bold text-indigo-700">What Our Users Say</h3>
        <p className="text-gray-600 mt-2">Real feedback from our happy customers</p>
      </div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <TestimonialCard
          feedback="I love how everything is organized. I never miss a warranty expiry now."
          name="Sneha Nair"
          role="Designer, Kochi"
          delay={0.2}
        />
        <TestimonialCard
          feedback="InsuraAI makes managing policies effortless. The reminders save me every time!"
          name="Rahul Mehta"
          role="Engineer, Mumbai"
          delay={0.4}
        />
        <TestimonialCard
          feedback="The AI extraction is a game changer. Uploading a document and auto-filling details is pure magic."
          name="Ananya Verma"
          role="Entrepreneur, Delhi"
          delay={0.6}
        />
      </div>
    </section>
  );
}