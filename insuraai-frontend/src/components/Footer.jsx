import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-14 px-6" id="contact">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">InsuraAI</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Simplifying insurance management with AI-powered tracking, reminders, and auto-renewals.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="text-white font-semibold mb-3">Product</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-indigo-400">Features</a></li>
            <li><a href="#how" className="hover:text-indigo-400">How It Works</a></li>
            <li><a href="#testimonials" className="hover:text-indigo-400">Testimonials</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white font-semibold mb-3">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-indigo-400">Documentation</a></li>
            <li><a href="#" className="hover:text-indigo-400">Blog</a></li>
            <li><a href="#" className="hover:text-indigo-400">FAQ</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="mailto:support@insuraai.com" className="hover:text-indigo-400">support@insuraai.com</a></li>
            <li><a href="#" className="hover:text-indigo-400">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-indigo-400">Terms of Service</a></li>
          </ul>
          {/* Social icons */}
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-indigo-400">🐦</a>
            <a href="#" className="hover:text-indigo-400">💼</a>
            <a href="#" className="hover:text-indigo-400">📸</a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto mt-12 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} InsuraAI. All rights reserved.
      </div>
    </footer>
  );
}