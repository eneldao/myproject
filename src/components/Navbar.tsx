'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="bg-transparent fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Trans-Easy Logo"
                  width={280}
                  height={280}
                  className="w-auto h-24 hover:opacity-90 transition-opacity"
                  priority
                />
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-white hover:text-[#00BFFF]">
              ABOUT
            </Link>
            <Link href="/contact" className="text-white hover:text-[#00BFFF]">
              CONTACT
            </Link>
            <Link href="/services" className="text-white hover:text-[#00BFFF]">
              SERVICES
            </Link>
            <Link href="/payment" className="text-white hover:text-[#00BFFF]">
              PRICING
            </Link>
            {user ? (
              <Link href="/dashboard" className="bg-[#00BFFF] text-white px-6 py-2 rounded-md hover:bg-[#0099CC]">
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/signin" className="bg-[#00BFFF] text-white px-6 py-2 rounded-md hover:bg-[#0099CC]">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#00BFFF] hover:bg-gray-800"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 bg-opacity-95">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/about" className="block px-3 py-2 text-white hover:text-[#00BFFF]">
              ABOUT
            </Link>
            <Link href="/contact" className="block px-3 py-2 text-white hover:text-[#00BFFF]">
              CONTACT
            </Link>
            <Link href="/services" className="block px-3 py-2 text-white hover:text-[#00BFFF]">
              SERVICES
            </Link>
            <Link href="/payment" className="block px-3 py-2 text-white hover:text-[#00BFFF]">
              PRICING
            </Link>
            {user ? (
              <Link href="/dashboard" className="block px-3 py-2 text-white hover:text-[#00BFFF]">
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/signin" className="block px-3 py-2 text-white hover:text-[#00BFFF]">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 