"use client";

import { motion } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import BackButton from "@/components/BackButton";

export default function ServicesPage() {
  const services = [
    {
      title: "Voice Over",
      icon: "🎙️",
      description: "Professional voice over services in multiple languages",
      features: [
        "Native speakers",
        "Multiple accents",
        "Character voices",
        "Commercial narration",
      ],
    },
    {
      title: "Dubbing",
      icon: "🎧",
      description: "High-quality dubbing for various content types",
      features: [
        "Lip sync",
        "Multi-language dubbing",
        "Audio mixing",
        "Character matching",
      ],
    },
    {
      title: "Translation",
      icon: "🌐",
      description: "Accurate translation services for all content",
      features: [
        "Document translation",
        "Subtitle translation",
        "Script adaptation",
        "Cultural localization",
      ],
    },
  ];

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
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Our Services</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            We provide comprehensive voice over, dubbing, and translation
            services to help your content reach a global audience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-colors"
            >
              <span className="text-4xl mb-4 block">{service.icon}</span>
              <h2 className="text-2xl font-bold text-white mb-4">
                {service.title}
              </h2>
              <p className="text-gray-300 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-200">
                    <svg
                      className="w-4 h-4 mr-2 text-[#00BFFF]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
