'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const ServiceCard = ({ title, description, image, link }: {
  title: string;
  description: string;
  image: string;
  link: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-48 mb-6">
        <Image
          src={image}
          alt={title}
          fill
          className="rounded-lg object-cover"
          priority
        />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 mb-6">{description}</p>
      <Link 
        href={link}
        className={`inline-block bg-[#00BFFF] text-white px-6 py-2 rounded-lg hover:bg-[#0099CC] transition-colors ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
        }`}
      >
        Learn More
      </Link>
    </div>
  );
};

const ServicesPage = () => {
  const services = [
    {
      title: "Voice-over",
      description: "Professional voice-over services for commercials, documentaries, and more.",
      image: "/voiceover.png",
      link: "/services/voice-over"
    },
    {
      title: "Dubbing",
      description: "High-quality dubbing services in multiple languages for films and videos.",
      image: "/dubbing.png",
      link: "/services/dubbing"
    },
    {
      title: "Transcription",
      description: "Accurate transcription services for audio and video content.",
      image: "/transcription.png",
      link: "/services/transcription"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] py-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Our Services</h1>
          <p className="text-lg text-gray-300">Professional audio services tailored to your needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage; 