'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type BaseFormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FreelancerFormData = BaseFormData & {
  skills: string;
  experience: string;
  hourlyRate: string;
  services: string[];
};

type ClientFormData = BaseFormData & {
  companyName: string;
  industry: string;
};

type FormData = FreelancerFormData | ClientFormData;

const Register = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'freelancer';
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    ...(type === 'freelancer' ? {
      skills: '',
      experience: '',
      hourlyRate: '',
      services: []
    } : {
      companyName: '',
      industry: ''
    })
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration logic
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && 'services' in formData) {
      const checkbox = e.target as HTMLInputElement;
      const services = [...formData.services];
      if (checkbox.checked) {
        services.push(value);
      } else {
        const index = services.indexOf(value);
        if (index > -1) {
          services.splice(index, 1);
        }
      }
      setFormData(prev => ({ ...prev, services } as FormData));
    } else {
      setFormData(prev => ({ ...prev, [name]: value } as FormData));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] py-12 px-4 sm:px-6 lg:px-8">
      {/* Logo Section */}
      <div className="flex justify-center mb-8">
        <Link href="/" className="inline-block">
          <Image
            src="/logo.png"
            alt="Trans-easy Logo"
            width={80}
            height={80}
            className="h-20 w-auto hover:opacity-80 transition-opacity"
            priority
          />
        </Link>
      </div>

      <div className="max-w-md mx-auto bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            Register as {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              className="mt-1 block w-full rounded-md bg-white bg-opacity-20 border border-gray-300 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full rounded-md bg-white bg-opacity-20 border border-gray-300 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 block w-full rounded-md bg-white bg-opacity-20 border border-gray-300 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className="mt-1 block w-full rounded-md bg-white bg-opacity-20 border border-gray-300 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {type === 'freelancer' && 'skills' in formData ? (
            <>
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-300">
                  Skills
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  placeholder="e.g., Voice Acting, Audio Editing"
                  className="mt-1 block w-full rounded-md bg-white bg-opacity-20 border border-gray-300 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Services Offered
                </label>
                <div className="space-y-2">
                  {['Dubbing', 'Transcription', 'Voice Over'].map((service) => (
                    <label key={service} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="services"
                        value={service}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-[#00BFFF] focus:ring-[#00BFFF]"
                      />
                      <span className="text-gray-300">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-300">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  min="0"
                  className="mt-1 block w-full rounded-md bg-white bg-opacity-20 border border-gray-300 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                />
              </div>
            </>
          ) : type === 'client' && 'companyName' in formData ? (
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-300">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className="mt-1 block w-full rounded-md bg-white bg-opacity-20 border border-gray-300 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
          ) : null}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00BFFF] hover:bg-[#0099CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00BFFF]"
            >
              Register
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-[#00BFFF] hover:text-[#0099CC]">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 