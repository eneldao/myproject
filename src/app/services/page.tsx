'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const ServiceCard = ({ title, description, image, href }: {
  title: string;
  description: string;
  image: string;
  href: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group bg-white bg-opacity-10 backdrop-blur-lg rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className={`object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="p-6 relative z-10">
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        <Link
          href={href}
          className={`inline-block bg-[#00BFFF] text-white px-6 py-2 rounded-md transition-all duration-300 transform ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
          } hover:bg-[#0099CC]`}
        >
          View Freelancers
        </Link>
      </div>
    </div>
  );
};

const ServicesPage = () => {
  const services = [
    {
      title: "Dubbing",
      description: "Professional voice dubbing services in multiple languages. Perfect for films, animations, and multimedia content.",
      image: "/dubbing.png",
      href: "/freelancers/dubbing"
    },
    {
      title: "Voice Over",
      description: "High-quality voice over services for commercials, documentaries, e-learning, and more.",
      image: "/voiceover.png",
      href: "/freelancers/voice-over"
    },
    {
      title: "Transcription",
      description: "Accurate and timely transcription services for audio and video content. Get your content in written form.",
      image: "/transcription.png",
      href: "/freelancers/transcription"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose from our range of professional audio services and connect with skilled freelancers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              {...service}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage; 