"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import AnimatedBackground from "@/components/AnimatedBackground";
import BackButton from "@/components/BackButton";

export default function AboutPage() {
  const features = [
    {
      title: "Professional Voice Over",
      description: "High-quality voice overs in multiple languages",
      icon: "🎙️",
    },
    {
      title: "Expert Dubbing",
      description: "Precise dubbing services for all types of content",
      icon: "🎧",
    },
    {
      title: "Quality Translation",
      description: "Accurate translations by native speakers",
      icon: "🌐",
    },
    {
      title: "Fast Turnaround",
      description: "Quick delivery without compromising quality",
      icon: "⚡",
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
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-6">
            About Trans-Easy
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-200 mb-6 text-lg">
                Trans-Easy is a leading platform connecting talented voice
                artists, dubbing professionals, and translators with clients
                worldwide. Our mission is to break down language barriers and
                help content reach global audiences.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <span className="text-3xl">{feature.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              className="relative h-[400px] rounded-xl overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
              <Image
                src="/recording-studio.jpg"
                alt="Recording Studio"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                quality={90}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                <h3 className="text-xl font-semibold mb-1">
                  State-of-the-Art Studio
                </h3>
                <p className="text-sm text-gray-200">
                  Professional equipment for high-quality productions
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
