import { useParams } from "react-router-dom";
import {
  useActivateClient,
  useDeactivateClient,
  useGetClinetById,
} from "@/api/queries";
import UpdateClient from "@/components/shared/UpdateClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import ClientDetailsSkeleton from "@/components/skeleton/ClientDetailsSkeleton";
import ClinetCardInfo from "@/components/shared/ClinetCardInfo";
import { Button } from "@/components/ui/button";

export default function ClientDetails() {
  const { clientsId } = useParams(); // Extract clientsId from URL
  const { toast } = useToast();

  // Fetch client details
  const {
    data: client,
    error,
    isError,
    isPending,
  } = useGetClinetById(clientsId!);

  // Mutations for activating and deactivating the client
  const activateClientMutation = useActivateClient(clientsId!);
  const deactivateClientMutation = useDeactivateClient(clientsId!);

  // Handle toast notifications for status updates
  useEffect(() => {
    if (activateClientMutation.isError || deactivateClientMutation.isError) {
      toast({
        variant: "destructive",
        title: `Failed to update client status`,
      });
    }

    if (activateClientMutation.isSuccess) {
      toast({ variant: "success", title: "Client activated successfully" });
    }

    if (deactivateClientMutation.isSuccess) {
      toast({ variant: "success", title: "Client deactivated successfully" });
    }
  }, [
    activateClientMutation.isError,
    deactivateClientMutation.isError,
    activateClientMutation.isSuccess,
    deactivateClientMutation.isSuccess,
    toast,
  ]);

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
            <div className="ml-4">{getStatusBadge(client.status)}</div>{" "}
            {/* Status Badge */}
          </h1>
          <p className="text-gray-600">{client.company_name}</p>
        </div>
        <div className="flex gap-6 ml-auto">
          <UpdateClient client={client} />
          {client.status === "Active" ? (
            <Button
              disabled={deactivateClientMutation.isPending}
              onClick={() => deactivateClientMutation.mutate()}
              className="bg-red-500"
            >
              Deactivate
            </Button>
          ) : (
            <Button
              disabled={activateClientMutation.isPending}
              onClick={() => activateClientMutation.mutate()}
              className="bg-cyan-500"
            >
              Active
            </Button>
          )}
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

      <ClinetCardInfo clientId={client._id.$oid} />
    </div>
  );
}
