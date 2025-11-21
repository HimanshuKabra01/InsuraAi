import React from "react";
import { ShieldCheck, Bell, BarChart, Clock } from "lucide-react";
import { FeatureCard } from "./UIComponents";

export default function Features() {
  return (
    <section id="features" className="bg-gray-50 py-20 px-6">
      <div className="container mx-auto text-center mb-12">
        <h3 className="text-3xl font-bold">Features</h3>
        <p className="text-gray-600 mt-2">
          Everything you need to stay on top of your policies.
        </p>
      </div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard
          icon={<ShieldCheck className="w-10 h-10 text-indigo-600" />}
          title="Secure Policies"
          desc="Store and manage all your policies in one safe place."
        />
        <FeatureCard
          icon={<Bell className="w-10 h-10 text-indigo-600" />}
          title="Smart Reminders"
          desc="Get notified before your policy expires—never miss a deadline."
        />
        <FeatureCard
          icon={<Clock className="w-10 h-10 text-indigo-600" />}
          title="Auto Renewals"
          desc="Easily extend your coverage with one click."
        />
        <FeatureCard
          icon={<BarChart className="w-10 h-10 text-indigo-600" />}
          title="Analytics"
          desc="Visualize premiums, renewals, and policy history."
        />
      </div>
    </section>
  );
}