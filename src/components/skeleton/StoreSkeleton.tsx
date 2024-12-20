import { Skeleton } from "../ui/skeleton";

export default function StoreSkeleton() {
  return (
    <div className="px-4 md:px-16 py-8 w-full">
      {/* Header Section */}
      <div className="flex justify-between items-center w-full mb-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-32" />
      </div>
      <hr className="mt-2 mb-6 border-gray-300" />

      {/* Data Table Skeleton */}
      <div className="container mx-auto py-10">
        <div className="mb-4">
          <Skeleton className="h-8 w-full mb-2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="p-4 rounded-lg shadow-md bg-white">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
