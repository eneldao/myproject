import { useRouter } from "next/router";

// pages/signup/index.tsx - Role selection landing page
export default function ChooseRolePage() {
  const router = useRouter();

  const selectRole = (role: string) => {
    router.push(`/signup/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#001F3F] to-[#003366]">
      <div className="max-w-3xl w-full space-y-8 bg-white/10 backdrop-blur-lg p-10 rounded-xl">
        <h1 className="text-center text-4xl font-bold text-white">
          Join Our Platform
        </h1>
        <p className="text-center text-xl text-gray-300">
          Choose how you want to use our platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <button
            onClick={() => selectRole("client")}
            className="flex flex-col items-center p-8 border-2 border-[#00BFFF] rounded-xl hover:bg-[#00BFFF]/20 transition-all"
          >
            <h3 className="text-2xl font-bold text-white mb-4">I'm a Client</h3>
            <p className="text-gray-300 text-center">
              Looking to hire talented freelancers for my projects
            </p>
          </button>

          <button
            onClick={() => selectRole("freelancer")}
            className="flex flex-col items-center p-8 border-2 border-[#00BFFF] rounded-xl hover:bg-[#00BFFF]/20 transition-all"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              I'm a Freelancer
            </h3>
            <p className="text-gray-300 text-center">
              Looking to offer my services and find new clients
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
