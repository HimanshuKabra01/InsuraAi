import React from "react";
import { ShieldCheck, Twitter, Linkedin, Instagram, Facebook, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 relative overflow-hidden" id="contact">
      
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Background Glow Effect */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">InsuraAI</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Simplifying insurance management with AI-powered tracking, reminders, and auto-renewals. 
              Peace of mind, automated.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Facebook className="w-5 h-5" />} />
            </div>
          </div>

          {/* 2. Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Product</h3>
            <ul className="space-y-4 text-sm">
              <FooterLink href="#features">Smart Features</FooterLink>
              <FooterLink href="#how">How it Works</FooterLink>
              <FooterLink href="#pricing">Pricing Plans</FooterLink>
              <FooterLink href="#testimonials">Success Stories</FooterLink>
            </ul>
          </div>

          {/* 3. Company & Legal */}
          <div>
            <h3 className="text-white font-semibold mb-6">Company</h3>
            <ul className="space-y-4 text-sm">
              <FooterLink href="#">About Us</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
            </ul>
          </div>

          {/* 4. Newsletter / Stay Connected */}
          <div>
            <h3 className="text-white font-semibold mb-6">Stay Updated</h3>
            <p className="text-sm text-slate-400 mb-4">
              Get the latest insurance tips and feature updates.
            </p>
            <form className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
                <button 
                  type="button"
                  className="absolute right-2 top-2 bg-indigo-600 p-1.5 rounded-md text-white hover:bg-indigo-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-slate-600">
                No spam. Unsubscribe anytime.
              </span>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} InsuraAI Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
             <a href="#" className="hover:text-white transition-colors">Support</a>
             <a href="#" className="hover:text-white transition-colors">Security</a>
             <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* --- Helper Components --- */

function SocialLink({ href, icon }) {
  return (
    <a
      href={href}
      className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all duration-300"
    >
      {icon}
    </a>
  );
}

function FooterLink({ href, children }) {
  return (
    <li>
      <a 
        href={href} 
        className="hover:text-indigo-400 transition-colors duration-200 flex items-center gap-1 group"
      >
        <span className="w-0 group-hover:w-2 h-0.5 bg-indigo-400 transition-all duration-300 inline-block"></span>
        {children}
      </a>
    </li>
  );
}