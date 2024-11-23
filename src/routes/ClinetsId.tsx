import { useNavigate, useParams } from "react-router-dom";
import { FaPhone, FaEnvelope, FaCalendar, FaStore } from "react-icons/fa";
import { useDeleteClient, useGetClinetById } from "@/api/queries";
import UpdateClient from "@/components/shared/UpdateClient";
import AlertDialogButton from "@/components/shared/AlertDialogButton";
import { formatData } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import ClientDetailsSkeleton from "@/components/skeleton/ClientDetailsSkeleton";
export default function ClientDetails() {
  const { clientsId } = useParams(); // Extract clientsId from URL
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    data: client,
    error,
    isError,
    isPending,
  } = useGetClinetById(clientsId!);

  const {
    mutate: deleteClinet,
    isError: isDeletingError,
    isPending: isDeletingPending,
    isSuccess,
    data,
  } = useDeleteClient(clientsId!);

  // Handle toast notifications and navigation
  useEffect(() => {
    if (isDeletingError) {
      toast({
        variant: "destructive",
        title: `Failed to delete Client`,
      });
    }

    if (isSuccess) {
      toast({ variant: "success", title: data });
      navigate(-1);
    }
  }, [isDeletingError, isSuccess, toast, navigate, data]);

  // Function to determine the badge color based on status
  const getStatusBadge = (status: string) => {
    let badgeColor = "bg-gray-200 text-gray-800"; // Default badge color
    if (status === "active") badgeColor = "bg-green-100 text-green-800";
    else if (status === "inactive") badgeColor = "bg-red-100 text-red-800";
    else if (status === "pending") badgeColor = "bg-yellow-100 text-yellow-800";

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeColor}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Render loading and error states without early returns
  if (isPending) {
    return <ClientDetailsSkeleton />;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="px-4 md:px-16 py-8 w-full">
      {/* Header Section */}
      <div className="flex items-center mb-8">
        <img
          src={client.profilePic || "/user.png"}
          alt={`${client.username}'s profile`}
          className="w-24 h-24 rounded-full mr-6"
        />
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            {client.username}
            <div className="ml-4">{getStatusBadge("active")}</div>{" "}
            {/* Status Badge */}
          </h1>
          <p className="text-gray-600">{client.company_name}</p>
        </div>
        <div className="flex gap-6 ml-auto">
          <UpdateClient client={client} />
          <AlertDialogButton
            isPending={isDeletingPending}
            onClick={deleteClinet}
            whatToDelete="client"
          />
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-blue-600">
            Outstanding Balance
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            $
            {client.totalOwed === undefined
              ? "0"
              : client.totalOwed?.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-green-600">Total Paid</h3>
          <p className="text-2xl font-bold text-green-600">
            $
            {client.totalPaid === undefined
              ? "0"
              : client.totalPaid?.toLocaleString()}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-yellow-600">
            Last Payment Date
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {/* {client.lastPaymentDate} */}
            2024-02-10
          </p>
        </div>
      </div>

      {/* Basic Info Section */}
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
            {formatData(client.created_at.$date.$numberLong)}
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
    </div>
  );
}
