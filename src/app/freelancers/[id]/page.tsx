import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaLanguage, FaMicrophone, FaHeadphones, FaPen } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Freelancer } from '@/lib/supabase';

async function getFreelancer(id: string) {
  const { data: freelancer, error } = await supabase
    .from('freelancers')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single();

  if (error || !freelancer) {
    return null;
  }

  return freelancer;
}

export default async function FreelancerProfile({ params }: { params: { id: string } }) {
  const freelancer = await getFreelancer(params.id);

  if (!freelancer) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 space-y-6">
              {/* Profile Image */}
              <div className="relative w-48 h-48 mx-auto">
                <Image
                  src={freelancer.profiles.avatar_url || '/default-avatar.png'}
                  alt={freelancer.profiles.full_name}
                  fill
                  className="rounded-full object-cover border-4 border-[#00BFFF]"
                  priority
                />
              </div>

              {/* Basic Info */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">{freelancer.profiles.full_name}</h1>
                <p className="text-[#00BFFF] font-medium mb-4">{freelancer.title}</p>
                <div className="flex items-center justify-center space-x-2 text-white">
                  <FaStar className="text-yellow-400" />
                  <span>{freelancer.rating}</span>
                  <span>({freelancer.reviews_count} reviews)</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-[#00BFFF] text-lg font-bold">{freelancer.completed_projects}</p>
                  <p className="text-gray-300 text-sm">Projects</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-[#00BFFF] text-lg font-bold">${freelancer.hourly_rate}</p>
                  <p className="text-gray-300 text-sm">Per Hour</p>
                </div>
              </div>

              {/* Contact Button */}
              <button className="w-full bg-[#00BFFF] text-white py-3 rounded-lg hover:bg-[#0099CC] transition-colors font-medium">
                Contact Me
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About Me</h2>
              <p className="text-gray-300 leading-relaxed">{freelancer.description}</p>
            </div>

            {/* Skills & Services */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Skills & Services</h2>
              
              {/* Languages */}
              <div className="mb-8">
                <h3 className="text-[#00BFFF] font-semibold mb-4 flex items-center">
                  <FaLanguage className="mr-2" /> Languages
                </h3>
                <div className="flex flex-wrap gap-3">
                  {freelancer.languages.map((language) => (
                    <span key={language} className="bg-white/5 text-white px-4 py-2 rounded-full">
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-[#00BFFF] font-semibold mb-4 flex items-center">
                  <FaMicrophone className="mr-2" /> Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {freelancer.services.map((service) => (
                    <div key={service} className="bg-white/5 p-4 rounded-lg text-center">
                      {service === 'Voice-over' && <FaMicrophone className="mx-auto text-2xl text-[#00BFFF] mb-2" />}
                      {service === 'Dubbing' && <FaHeadphones className="mx-auto text-2xl text-[#00BFFF] mb-2" />}
                      {service === 'Transcription' && <FaPen className="mx-auto text-2xl text-[#00BFFF] mb-2" />}
                      <span className="text-white">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[#00BFFF] font-semibold">Response Time</p>
                  <p className="text-white">{freelancer.response_time}</p>
                </div>
                <div>
                  <p className="text-[#00BFFF] font-semibold">Member Since</p>
                  <p className="text-white">{new Date(freelancer.created_at).getFullYear()}</p>
                </div>
                <div>
                  <p className="text-[#00BFFF] font-semibold">Last Active</p>
                  <p className="text-white">Recently Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 