import { FaSearch } from "react-icons/fa";

export default function ClientsSkeleton() {
  const SkeletonBox = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-300 ${className}`}></div>
  );

  return (
    <div className="px-4 md:px-16 py-8 w-full">
      <div className="flex justify-between items-center w-full mb-4">
        <SkeletonBox className="h-8 w-1/4" />
        <SkeletonBox className="h-10 w-32" />
      </div>
      <hr className="mt-2" />

      {/* Status Cards Section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 md:grid-cols-3">
        <SkeletonBox className="h-40 p-4 rounded-lg shadow-lg" />
        <SkeletonBox className="h-40 p-4 rounded-lg shadow-lg" />
        <SkeletonBox className="h-40 p-4 rounded-lg shadow-lg" />
      </div>

      {/* Search Section */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <SkeletonBox className="h-6 w-32 mr-4" />
          <div className="relative flex-grow max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <SkeletonBox className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="border border-gray-300 p-4 rounded-lg shadow-md bg-white flex flex-col items-center text-center"
            >
              <SkeletonBox className="w-24 h-24 rounded-full object-cover mb-4" />
              <div className="flex justify-start flex-col mt-6">
                <SkeletonBox className="h-6 w-32 mb-2" />
                <SkeletonBox className="h-4 w-24 mb-2" />
              </div>
              <SkeletonBox className="h-4 w-full mb-2" />
              <SkeletonBox className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
