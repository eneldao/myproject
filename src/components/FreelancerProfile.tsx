import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

interface Service {
  title: string;
  items: string[];
}

interface FreelancerProfileProps {
  name: string;
  imageUrl: string;
  rating: number;
  about: string;
  services: {
    voiceOver: string[];
    conferenceInterpretation: string[];
  };
  languages: string[];
  roles: string[];
}

const FreelancerProfile = ({
  name,
  imageUrl,
  rating,
  about,
  services,
  languages,
  roles
}: FreelancerProfileProps) => {
  const ServiceSection = ({ title, items }: Service) => (
    <div className="bg-[#0a192f]/40 rounded-lg p-6">
      <h3 className="text-[#00BFFF] text-xl font-semibold mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-white flex items-center">
            <span className="text-[#00BFFF] mr-2">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="bg-[#0a192f]/40 rounded-lg p-6 text-center">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
          <div className="flex items-center justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-400"}
              />
            ))}
            <span className="ml-2 text-white">{rating}</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {roles.map((role, index) => (
              <span
                key={index}
                className="bg-[#00BFFF]/20 text-[#00BFFF] px-3 py-1 rounded-full text-sm"
              >
                {role}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {languages.map((language, index) => (
              <span
                key={index}
                className="bg-[#003366] text-white px-3 py-1 rounded-full text-sm"
              >
                {language}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column - About & Services */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-[#0a192f]/40 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">About Me</h2>
            <p className="text-gray-300">{about}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ServiceSection
                title="Voice Over"
                items={services.voiceOver}
              />
              <ServiceSection
                title="Conference Interpretation"
                items={services.conferenceInterpretation}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile; 