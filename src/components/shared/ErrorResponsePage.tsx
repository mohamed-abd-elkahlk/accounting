import "@tanstack/react-query";

// Extend `@tanstack/react-query` to define a default error type
declare module "@tanstack/react-query" {
  interface Register {
    defaultError: QueryError; // Use your custom error type here
  }
}

// Define a custom error class
export class QueryError extends Error {
  code: number; // HTTP-like status code
  details?: string; // Optional additional details

  constructor(message: string, code: number, details?: string) {
    super(message);
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, QueryError.prototype); // Maintain correct prototype chain
  }
}

// Error response component
interface ErrorResponseProps {
  error: QueryError;
}

const ErrorResponsePage: React.FC<ErrorResponseProps> = ({ error }) => {
  const { code, message, details } = error;

  // Generate status badge
  const getStatusBadge = (code: number) => {
    let badgeColor = "bg-gray-200 text-gray-800";
    if (code >= 200 && code < 300) badgeColor = "bg-green-100 text-green-800";
    else if (code >= 400 && code < 500)
      badgeColor = "bg-yellow-100 text-yellow-800";
    else if (code >= 500) badgeColor = "bg-red-100 text-red-800";

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeColor}`}
      >
        {code}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="text-xl font-bold mr-4">Error Details</div>
          {getStatusBadge(code)}
        </div>

        {/* Error Information */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Message</h1>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>

        {/* Optional Details */}
        {details && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Details</h2>
            <p className="text-gray-600 mt-2">{details}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => window.history.back()} // Go back to the previous page
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorResponsePage;
