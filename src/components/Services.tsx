import Link from 'next/link';
import { FaMicrophone, FaHeadphones, FaFileAlt } from 'react-icons/fa';

const ServiceCard = ({ title, description, icon: Icon, href }: { 
  title: string; 
  description: string; 
  icon: any;
  href: string;
}) => (
  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 hover:transform hover:scale-105 transition-all duration-300">
    <div className="text-[#00BFFF] text-4xl mb-4">
      <Icon />
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-gray-300 mb-6">{description}</p>
    <Link 
      href={href}
      className="inline-block bg-[#00BFFF] text-white px-6 py-2 rounded-md hover:bg-[#0099CC] transition-colors"
    >
      View Freelancers
    </Link>
  </div>
);

const Services = () => {
  const services = [
    {
      title: "Dubbing",
      description: "Professional voice dubbing services in multiple languages. Perfect for films, animations, and multimedia content.",
      icon: FaHeadphones,
      href: "/freelancers/dubbing"
    },
    {
      title: "Transcription",
      description: "Accurate and timely transcription services for audio and video content. Get your content in written form.",
      icon: FaFileAlt,
      href: "/freelancers/transcription"
    },
    {
      title: "Voice Over",
      description: "High-quality voice over services for commercials, documentaries, e-learning, and more.",
      icon: FaMicrophone,
      href: "/freelancers/voice-over"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-4">Our Services</h2>
        <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Choose from our range of professional audio services. Connect with skilled freelancers 
          specializing in dubbing, transcription, and voice over work.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services; 