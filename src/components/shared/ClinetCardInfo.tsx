import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  FaCalendar,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaStore,
  FaUser,
  FaDollarSign,
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
              <Skeleton
                key={index}
                className="h-5 bg-gray-300 rounded-md animate-pulse mb-2"
              />
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
    return <p>Client not found</p>;
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center text-gray-700">
          <FaUser className="mr-2 text-blue-500" /> Client Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name */}
          <p className="flex items-center">
            <FaStore className="mr-2 text-gray-700" />
            <strong>Company:</strong> {client.company_name}
          </p>

          {/* Phone */}
          <p className="flex items-center">
            <FaPhone className="mr-2 text-blue-600" />
            <strong>Phone:</strong> {client.phone}
          </p>

          {/* Email */}
          <p className="flex items-center">
            <FaEnvelope className="mr-2 text-red-500" />
            <strong>Email:</strong> {client.email || "N/A"}
          </p>

          {/* Registration Date */}
          <p className="flex items-center">
            <FaCalendar className="mr-2 text-green-500" />
            <strong>Registered on:</strong>{" "}
            {formatData(client.created_at.$date.$numberLong!)}
          </p>

          {/* City */}
          <p className="flex items-center">
            <FaMapMarkerAlt className="mr-2 text-orange-500" />
            <strong>City:</strong> {client.city}
          </p>

          {/* Address */}
          <p className="flex items-center">
            <FaMapMarkerAlt className="mr-2 text-gray-700" />
            <strong>Address:</strong> {client.address}
          </p>

          {/* Status */}
          <p className="flex items-center">
            <FaUser className="mr-2 text-purple-500" />
            <strong>Status:</strong>{" "}
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </p>

          {/* Last Payment */}
          {/* <p className="flex items-center">
            <FaDollarSign className="mr-2 text-green-600" />
            <strong>Last Payment:</strong>{" "}
            {client.lastPaymentDate
              ? new Date(client.lastPaymentDate).toLocaleDateString()
              : "No payment yet"}
          </p> */}
        </div>
      </CardContent>
    </Card>
  );
}
