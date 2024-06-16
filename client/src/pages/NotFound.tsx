import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

function NotFoundPage() {
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center h-screen text-center">
      <Icon
        icon="uil:exclamation-triangle"
        className="w-24 h-24 text-teal-500 mb-4"
      />
      <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-900 mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-500 mb-8 w-1/3">
        Oops! The page you're looking for doesn't exist. It might have been
        removed or you might have typed the wrong URL.
      </p>
      <Link
        to="/"
        className="from-teal-500 to-green-500 hover:from-teal-700 hover:to-green-700 bg-gradient-to-r text-white font-semibold py-4 px-5 rounded-md flex items-center gap-2 transition-all duration-200"
      >
        <Icon icon="uil:arrow-left" className="w-6 h-6" />
        Go Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
