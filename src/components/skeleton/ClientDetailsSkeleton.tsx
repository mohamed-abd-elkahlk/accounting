export default function ClientDetailsSkeleton() {
  const SkeletonBox = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-300 ${className}`}></div>
  );

  return (
    <div className="px-4 md:px-16 py-8 w-full">
      {/* Header Section */}
      <div className="flex items-center mb-8">
        <SkeletonBox className="w-24 h-24 rounded-full mr-6" />
        <div>
          <SkeletonBox className="h-6 w-48 mb-2" />
          <SkeletonBox className="h-4 w-32" />
        </div>
        <div className="flex gap-6 ml-auto">
          <SkeletonBox className="h-10 w-24 rounded-lg" />
          <SkeletonBox className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-100 p-4 rounded-lg shadow-lg text-center">
          <SkeletonBox className="h-6 w-40 mx-auto mb-2" />
          <SkeletonBox className="h-8 w-20 mx-auto" />
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-lg text-center">
          <SkeletonBox className="h-6 w-40 mx-auto mb-2" />
          <SkeletonBox className="h-8 w-20 mx-auto" />
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-lg text-center">
          <SkeletonBox className="h-6 w-40 mx-auto mb-2" />
          <SkeletonBox className="h-8 w-20 mx-auto" />
        </div>
      </div>

      {/* Basic Info Section */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Client Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonBox key={i} className="h-4 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}