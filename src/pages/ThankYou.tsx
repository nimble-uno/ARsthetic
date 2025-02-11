import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Thank You!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your files have been uploaded successfully.
        </p>
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Return to Upload Page
          </Link>
        </div>
      </div>
    </div>
  );
}