import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] overflow-hidden">
      <div className="max-w-7xl mx-auto relative pt-20">
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center justify-between">
          {/* Text Content */}
          <div className="lg:w-1/2 text-white">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#00BFFF] mb-4 mt-[-20px] animate-fade-in-slide opacity-0 transform translate-y-4">Welcome to Trans-Easy</h2>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-white">Where Every Voice </span>
              <span className="text-[#00BFFF]">Finds Its Place.</span>
            </h1>
            <p className="text-lg lg:text-xl mb-8 text-gray-300">
              Welcome to Trans-easy, where creativity meets innovation.
              We're a dynamic studio specializing in dubbing, transcription
              and voice over, dedicated to bringing your vision to life with
              passion and precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup/freelancer"
                className="bg-[#00BFFF] text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-[#0099CC] transition-colors text-center"
              >
                JOIN AS FREELANCER
              </Link>
              <Link
                href="/signup/client"
                className="border-2 border-[#00BFFF] text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-[#00BFFF] transition-colors text-center"
              >
                JOIN AS CLIENT
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <div className="floating">
              <Image
                src="/headphone.png"
                alt="Professional Headphones"
                width={600}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 