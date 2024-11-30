import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function InvoiceDetailsSkeleton() {
  return (
    <div className="mt-6 flex flex-col items-center w-full px-4 space-y-6">
      {/* Skeleton for Invoice Header */}
      <Card className="w-full max-w-screen-2xl shadow-lg">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-3/4 bg-gray-300 rounded-md animate-pulse" />
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Skeleton for Top Section */}
      <div className="w-full max-w-screen-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-1/2 bg-gray-300 rounded-md animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-5/6 mb-2 bg-gray-300 rounded-md animate-pulse" />
            <Skeleton className="h-4 w-2/3 mb-2 bg-gray-300 rounded-md animate-pulse" />
            <Skeleton className="h-4 w-1/2 bg-gray-300 rounded-md animate-pulse" />
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-1/3 bg-gray-300 rounded-md animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-4 w-full mb-2 bg-gray-300 rounded-md animate-pulse"
                />
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Skeleton for Products Section */}
      <Card className="w-full max-w-screen-2xl shadow-md">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-1/4 bg-gray-300 rounded-md animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full bg-gray-300 rounded-md animate-pulse" />
        </CardContent>
      </Card>

      {/* Skeleton for Dates Section */}
      <Card className="w-full max-w-screen-2xl shadow-md">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-1/4 bg-gray-300 rounded-md animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-2/3 mb-2 bg-gray-300 rounded-md animate-pulse" />
          <Skeleton className="h-4 w-1/3 bg-gray-300 rounded-md animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}
