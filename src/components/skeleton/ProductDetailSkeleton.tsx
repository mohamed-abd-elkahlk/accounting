export default function ProductDetailsSkeleton() {
  const SkeletonBox = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-300 ${className}`}></div>
  );

  return (
    <div className="px-4 md:px-16 py-8 w-full">
      {/* Header Section */}
      <div className="flex items-center mb-8">
        <SkeletonBox className="w-24 h-24 rounded-full mr-6 border border-gray-300 shadow" />
        <div>
          <SkeletonBox className="h-6 w-32 mb-2" />
          <SkeletonBox className="h-4 w-64" />
        </div>
        <div className="flex gap-6 ml-auto">
          <SkeletonBox className="h-10 w-24 rounded-md" />
          <SkeletonBox className="h-10 w-24 rounded-md" />
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 p-4 rounded-lg shadow-lg text-center"
          >
            <SkeletonBox className="h-8 w-2/3 mx-auto mb-4" />
            <SkeletonBox className="h-6 w-1/2 mx-auto" />
          </div>
        ))}
      </div>

      {/* Basic Info Section */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <SkeletonBox className="h-8 w-1/2 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <SkeletonBox key={index} className="h-6 w-full mb-2" />
          ))}
        </div>
      </section>
    </div>
  );
}
