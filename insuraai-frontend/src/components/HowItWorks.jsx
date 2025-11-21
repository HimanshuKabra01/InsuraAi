import React from "react";
import { StepCard } from "./UIComponents";

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 px-6">
      <div className="container mx-auto text-center mb-12">
        <h3 className="text-3xl font-bold">How It Works</h3>
      </div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <StepCard step="1" title="Signup" desc="Create your free InsuraAI account." />
        <StepCard step="2" title="Add Policies" desc="Upload details of your existing policies." />
        <StepCard step="3" title="Relax" desc="We’ll remind you and auto-extend when needed." />
      </div>
    </section>
  );
}