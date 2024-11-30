import { Skeleton } from "../ui/skeleton";

const InvoicesSkeleton = () => {
  return (
    <div className="px-4 md:px-16 py-8 w-full">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center w-full mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-20" />
      </div>
      <hr className="mt-2 mb-6 border-gray-300" />

      {/* Status Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              className="shadow-md bg-gray-100 rounded-lg p-4 space-y-4"
            >
              <Skeleton className="h-12 w-12 mx-auto" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-10 w-1/2 mx-auto" />
            </div>
          ))}
      </div>

      {/* Invoice Table Skeleton */}
      <div className="mt-10">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 grid grid-cols-4 gap-4">
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <Skeleton key={index} className="h-6 w-full" />
              ))}
          </div>
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="p-4 grid grid-cols-4 gap-4">
                {Array(4)
                  .fill(null)
                  .map((_, colIndex) => (
                    <Skeleton key={colIndex} className="h-6 w-full" />
                  ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default InvoicesSkeleton;
