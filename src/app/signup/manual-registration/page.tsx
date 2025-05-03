export default function ManualRegistrationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Registration Complete
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Thank you for registering
          </p>
        </div>

        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Registration Complete!
              </h3>
              <p className="text-sm text-green-700">
                Your account has been created successfully.
              </p>
              <p className="mt-2 font-medium text-sm text-green-700">
                You will be automatically redirected to the login page shortly.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Go to Login
          </a>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
            setTimeout(() => {
              window.location.href = '/auth/signin';
            }, 5000);
          `,
          }}
        />
      </div>
    </div>
  );
}
