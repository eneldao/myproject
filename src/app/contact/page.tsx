"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import BackButton from "@/components/BackButton";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Add your form submission logic here
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    alert("Message sent successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] py-10 relative">
      <AnimatedBackground />
      <div className="container mx-auto px-4 relative z-10">
        {/* Add BackButton */}
        <div className="mb-8">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8"
        >
          <h1 className="text-4xl font-bold text-white mb-8">Contact Us</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Get in Touch
              </h2>
              <div className="space-y-4 text-gray-200">
                <p>Have questions about our services?</p>
                <div className="flex items-center space-x-3">
                  <span className="text-[#00BFFF]">📧</span>
                  <span>support@trans-easy.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[#00BFFF]">📱</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[#00BFFF]">📍</span>
                  <span>123 Content Street, Digital City</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                required
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                required
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                required
              ></textarea>
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#00BFFF] text-white py-2 rounded-lg hover:bg-[#0099CC] transition-colors disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
