import { FaEnvelope, FaPhone } from 'react-icons/fa';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-lg text-gray-300">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-white mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-white mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-white mb-2">Message</label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:border-[#00BFFF] transition-colors resize-none"
                  placeholder="Your message..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-[#00BFFF] text-white py-3 rounded-lg hover:bg-[#0099CC] transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#00BFFF] p-3 rounded-lg">
                    <FaEnvelope className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Email Us</h3>
                    <a href="mailto:contact@trans-easy.com" className="text-gray-300 hover:text-[#00BFFF] transition-colors">
                      contact@trans-easy.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#00BFFF] p-3 rounded-lg">
                    <FaPhone className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Call Us</h3>
                    <a href="tel:+213781830792" className="text-gray-300 hover:text-[#00BFFF] transition-colors">
                      +213 781 830 792
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#00BFFF] font-semibold mb-2">What services do you offer?</h4>
                  <p className="text-gray-300">We provide professional dubbing, voice-over, and transcription services in multiple languages.</p>
                </div>
                <div>
                  <h4 className="text-[#00BFFF] font-semibold mb-2">How long does a typical project take?</h4>
                  <p className="text-gray-300">Project timelines vary based on complexity and length. Contact us for a detailed estimate.</p>
                </div>
                <div>
                  <h4 className="text-[#00BFFF] font-semibold mb-2">Do you offer rush services?</h4>
                  <p className="text-gray-300">Yes, we offer expedited services for urgent projects at additional rates.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 