import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  FaCalendar,
  FaEnvelope,
  FaPhone,
  FaStore,
  FaUser,
} from "react-icons/fa";
import { useGetClinetById } from "@/api/queries";
import { Skeleton } from "../ui/skeleton";
import { formatData } from "@/lib/utils";

export default function ClinetCardInfo({ clientId }: { clientId: string }) {
  const {
    data: client,
    isLoading: isClientLoading,
    error: clientError,
  } = useGetClinetById(clientId);
  console.log(clientId);
  if (isClientLoading) {
    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center text-gray-700">
            <FaUser className="mr-2 text-blue-500" /> Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array(6)
            .fill(null)
            .map((_, index) => (
              <p key={index} className="text-gray-600">
                <Skeleton className="h-5 bg-gray-300 rounded-md animate-pulse" />
              </p>
            ))}
        </CardContent>
      </Card>
    );
  }

  if (clientError) {
    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center text-gray-700">
            <FaUser className="mr-2 text-blue-500" /> Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            Failed to load client information. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }
  if (!client) {
    return <p>client not found</p>;
  }
  return (
    <section className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Client Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <p>
          <FaStore className="inline mr-2 text-gray-700" />{" "}
          <strong>Company:</strong> {client.company_name}
        </p>
        <p>
          <FaPhone className="inline mr-2 text-blue-600" />{" "}
          <strong>Phone:</strong> {client.phone}
        </p>
        <p>
          <FaEnvelope className="inline mr-2 text-red-500" />{" "}
          <strong>Email:</strong> {client.email || "N/A"}
        </p>
        <p>
          <FaCalendar className="inline mr-2 text-green-500" />{" "}
          <strong>Registered on:</strong>
          {formatData(client.created_at.$date.$numberLong!)}
        </p>
        <p>
          <strong>City:</strong> {client.city}
        </p>
        <p>
          <strong>Country:</strong> {client.city}
        </p>
        <p>
          <strong>Address:</strong> {client.address}
        </p>
        <p>
          <strong>Status:</strong> active
        </p>
      </div>
    </section>
  );
}
