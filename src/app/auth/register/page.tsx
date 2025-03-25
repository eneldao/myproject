'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface FormData {
  email: string;
  password: string;
  fullName: string;
  about: string;
  languages: string[];
  roles: string[];
  voiceOverServices: string[];
  interpretationServices: string[];
  selectedPlan: string | null;
  billingPeriod: string;
}

const availableLanguages = ['Arabic', 'English', 'French', 'Spanish', 'German'];
const availableRoles = ['Voice Over', 'Conference Interpreter'];
const voiceOverOptions = [
  'Commercial Voice Overs',
  'Documentary Narration',
  'E-learning Content',
  'Corporate Videos',
  'IVR & Phone Systems',
  'Animation & Gaming'
];
const interpretationOptions = [
  'Simultaneous Interpretation',
  'Consecutive Interpretation',
  'Business Meetings',
  'International Conferences',
  'Legal Proceedings',
  'Medical Interpretation'
];

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'freelancer';
  const selectedPlan = searchParams.get('plan');
  const billingPeriod = searchParams.get('billing');

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    about: '',
    languages: [],
    roles: [],
    voiceOverServices: [],
    interpretationServices: [],
    selectedPlan: selectedPlan || null,
    billingPeriod: billingPeriod || 'month'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category: keyof FormData, item: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create auth user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: type,
            selected_plan: formData.selectedPlan,
            billing_period: formData.billingPeriod
          }
        }
      });

      if (signUpError) throw signUpError;

      if (user) {
        if (type === 'freelancer') {
          // Create freelancer profile
          const { error: profileError } = await supabase
            .from('freelancer_profiles')
            .insert([{
              user_id: user.id,
              name: formData.fullName,
              image_url: '/default-avatar.png',
              rating: 0,
              about: formData.about,
              services: {
                voiceOver: formData.voiceOverServices,
                conferenceInterpretation: formData.interpretationServices
              },
              languages: formData.languages,
              roles: formData.roles
            }]);

          if (profileError) throw profileError;
        } else {
          // Create client profile with selected plan
          const { error: clientError } = await supabase
            .from('client_profiles')
            .insert([{
              user_id: user.id,
              name: formData.fullName,
              plan: formData.selectedPlan,
              billing_period: formData.billingPeriod
            }]);

          if (clientError) throw clientError;
        }
      }

      // Redirect to payment processing if plan was selected
      if (formData.selectedPlan) {
        router.push(`/payment/process?plan=${formData.selectedPlan}&billing=${formData.billingPeriod}`);
      } else {
        router.push('/auth/signin');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Trans-easy Logo"
              width={80}
              height={80}
              className="h-20 w-auto"
              priority
            />
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">
              Register as {type.charAt(0).toUpperCase() + type.slice(1)}
              {selectedPlan && (
                <span className="block text-lg text-[#00BFFF] mt-2">
                  Selected Plan: {selectedPlan} ({billingPeriod}ly)
                </span>
              )}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Basic Information</h3>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-md bg-white/5 border border-gray-600 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                  value={formData.email}
                  onChange={handleInputChange}
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
                  className="mt-1 block w-full rounded-md bg-white/5 border border-gray-600 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  className="mt-1 block w-full rounded-md bg-white/5 border border-gray-600 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {type === 'freelancer' && (
              <>
                {/* About */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">About You</h3>
                  <div>
                    <label htmlFor="about" className="block text-sm font-medium text-gray-300">
                      Professional Bio
                    </label>
                    <textarea
                      id="about"
                      name="about"
                      required
                      rows={4}
                      className="mt-1 block w-full rounded-md bg-white/5 border border-gray-600 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                      value={formData.about}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Languages</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {availableLanguages.map(language => (
                      <label key={language} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(language)}
                          onChange={() => handleCheckboxChange('languages', language)}
                          className="form-checkbox h-5 w-5 text-[#00BFFF]"
                        />
                        <span className="text-white">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Roles */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Roles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {availableRoles.map(role => (
                      <label key={role} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role)}
                          onChange={() => handleCheckboxChange('roles', role)}
                          className="form-checkbox h-5 w-5 text-[#00BFFF]"
                        />
                        <span className="text-white">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Services</h3>
                  
                  {/* Voice Over Services */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-[#00BFFF]">Voice Over Services</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {voiceOverOptions.map(service => (
                        <label key={service} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.voiceOverServices.includes(service)}
                            onChange={() => handleCheckboxChange('voiceOverServices', service)}
                            className="form-checkbox h-5 w-5 text-[#00BFFF]"
                          />
                          <span className="text-white">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Interpretation Services */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-[#00BFFF]">Interpretation Services</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {interpretationOptions.map(service => (
                        <label key={service} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.interpretationServices.includes(service)}
                            onChange={() => handleCheckboxChange('interpretationServices', service)}
                            className="form-checkbox h-5 w-5 text-[#00BFFF]"
                          />
                          <span className="text-white">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00BFFF] text-white py-3 rounded-lg hover:bg-[#0099CC] transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-sm text-gray-300 mt-6">
            <Link href="/auth/signin" className="font-medium text-[#00BFFF] hover:text-[#0099CC]">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 