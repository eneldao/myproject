"use client";

<<<<<<< HEAD
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
=======
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
>>>>>>> new-safe-branch

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState("freelancer");
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [services, setServices] = useState("");
  const [languages, setLanguages] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Build the additional data object based on user type
      const additionalData =
        userType === "freelancer"
          ? {
              title,
              description,
              hourly_rate: hourlyRate,
              services: services
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              languages: languages
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : {
              company_name: companyName,
              contact_name: contactName || fullName,
              contact_email: contactEmail || email,
            };

<<<<<<< HEAD
// This component uses the useSearchParams hook
const RegisterForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type') || 'freelancer';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
    setLoading(true);
    setError('');
    
    try {
      console.log('Form submitted:', formData);
      
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // 1. Create the user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: type
          }
        }
      });
      
      if (authError) throw authError;
      
      // 2. Store additional profile data based on user type
      if (authData.user) {
        const userId = authData.user.id;
        
        // Create base profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: formData.fullName,
            email: formData.email,
            user_type: type
          });
          
        if (profileError) throw profileError;
        
        // Add type-specific data
        if (type === 'freelancer' && 'skills' in formData) {
          const { error: freelancerError } = await supabase
            .from('freelancers')
            .insert({
              user_id: userId,
              skills: formData.skills,
              experience: formData.experience,
              hourly_rate: parseFloat(formData.hourlyRate) || 0,
              services: formData.services
            });
            
          if (freelancerError) throw freelancerError;
        } else if (type === 'client' && 'companyName' in formData) {
          const { error: clientError } = await supabase
            .from('clients')
            .insert({
              user_id: userId,
              company_name: formData.companyName,
              industry: formData.industry
            });
            
          if (clientError) throw clientError;
        }
        
        // Redirect to login or dashboard
        alert('Registration successful! Please check your email to verify your account.');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };
=======
      // Use our AuthContext signup function
      const response = await signup(
        email,
        password,
        fullName,
        userType,
        additionalData
      );

      if (response.success) {
        setSuccess(true);
        // Save form data for the manual registration process
        sessionStorage.setItem(
          "registrationFormData",
          JSON.stringify({
            email,
            fullName,
            userType,
            ...additionalData,
          })
        );
>>>>>>> new-safe-branch

        // Redirect to manual registration confirmation page
        router.push(
          `/signup/manual-registration?email=${encodeURIComponent(
            email
          )}&type=${userType}`
        );
      } else {
        setError(response.error?.message || "Failed to create account");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Account created successfully! Redirecting...
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label
                htmlFor="userType"
                className="block text-sm font-medium text-gray-700"
              >
                Account Type
              </label>
              <select
                id="userType"
                name="type"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
              </select>
            </div>

            {userType === "client" && (
              <>
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contactName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contact Name
                  </label>
                  <input
                    id="contactName"
                    name="contactName"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contact Email
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </>
            )}

            {userType === "freelancer" && (
              <>
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hourlyRate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Hourly Rate
                  </label>
                  <input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="services"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Services (comma separated)
                  </label>
                  <input
                    id="services"
                    name="services"
                    type="text"
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="languages"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Languages (comma separated)
                  </label>
                  <input
                    id="languages"
                    name="languages"
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <button
              type="submit"
<<<<<<< HEAD
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00BFFF] hover:bg-[#0099CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00BFFF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
=======
              disabled={loading || success}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? "Creating account..." : "Sign up"}
>>>>>>> new-safe-branch
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};

// Wrap the component that uses useSearchParams in a Suspense boundary
const Register = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>}>
      <RegisterForm />
    </Suspense>
  );
};

export default Register; 
=======
}
>>>>>>> new-safe-branch
