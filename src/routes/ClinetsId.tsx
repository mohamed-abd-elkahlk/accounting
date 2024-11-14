import { useParams } from "react-router-dom";
import {
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaDollarSign,
  FaCalendar,
  FaUser,
} from "react-icons/fa";

export default function ClientDetails() {
  const { ClientId } = useParams(); // Get client ID from the URL

  const client = {
    id: ClientId,
    username: `Username 1`,
    phone: "+201112345678",
    email: `user1@example.com`,
    companyName: `Sample Company 1`,
    companyAddress: "456 Business Rd, Cairo, Egypt",
    city: "Cairo",
    country: "Egypt",
    profilePic: `https://via.placeholder.com/150?text=User+${1}`,
    status: "active", // Status of the client
    registrationDate: "2024-01-01",
    totalOwedByClient: 5000,
    totalOwedToClient: 3000,
    lastPaymentDate: "2024-02-10",
    notes: "Client prefers email communication",
    billingFrequency: "monthly",
    preferredPaymentMethod: "bank transfer",
    contactPerson: {
      name: "Contact Name",
      position: "Accountant",
      phone: "+201123456789",
      email: "contact@example.com",
    },
  };

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

  return (
    <div className="px-4 md:px-16 py-8 w-full">
      {/* Header Section */}
      <div className="flex items-center mb-8">
        <img
          src={client.profilePic}
          alt={`${client.username}'s profile`}
          className="w-24 h-24 rounded-full mr-6"
        />
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            {client.username}
            <div className="ml-4">{getStatusBadge(client.status)}</div>{" "}
            {/* Status Badge */}
          </h1>
          <p className="text-gray-600">{client.companyName}</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-blue-600">
            Outstanding Balance
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            ${client.totalOwedByClient}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-green-600">Total Paid</h3>
          <p className="text-2xl font-bold text-green-600">
            ${client.totalOwedToClient}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-yellow-600">
            Last Payment Date
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {client.lastPaymentDate}
          </p>
        </div>
      </div>

      {/* Basic Info Section */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Client Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p>
            <FaBuilding className="inline mr-2 text-gray-700" />{" "}
            <strong>Company:</strong> {client.companyName}
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
            <strong>Registered on:</strong> {client.registrationDate}
          </p>
          <p>
            <strong>City:</strong> {client.city}
          </p>
          <p>
            <strong>Country:</strong> {client.country}
          </p>
          <p>
            <strong>Address:</strong> {client.companyAddress}
          </p>
          <p>
            <strong>Status:</strong> {client.status}
          </p>
        </div>
      </section>

      {/* Financial Information Section */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Financial Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p>
            <FaDollarSign className="inline mr-2 text-green-500" />{" "}
            <strong>Total Owed by Client:</strong> $
            {client.totalOwedByClient.toLocaleString()}
          </p>
          <p>
            <FaDollarSign className="inline mr-2 text-red-500" />{" "}
            <strong>Total Owed to Client:</strong> $
            {client.totalOwedToClient.toLocaleString()}
          </p>
          <p>
            <FaCalendar className="inline mr-2 text-blue-500" />{" "}
            <strong>Last Payment Date:</strong> {client.lastPaymentDate}
          </p>
          <p>
            <strong>Billing Frequency:</strong> {client.billingFrequency}
          </p>
          <p>
            <strong>Preferred Payment Method:</strong>{" "}
            {client.preferredPaymentMethod}
          </p>
        </div>
      </section>
    </div>
  );
}
