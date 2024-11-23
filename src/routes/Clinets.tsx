import NewClient from "@/components/shared/NewClient";
import { useState } from "react";
import {
  FaUsers,
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaSearch,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetClinets } from "@/api/queries";
import { Client } from "@/types";
import ClientsSkeleton from "@/components/skeleton/ClientSkeleton";
import ErrorResponsePage from "@/components/shared/ErrorResponsePage";

export default function Clients() {
  const totalOwedByMe = 10000;
  const totalOwedToMe = 7500;
  const [searchTerm, setSearchTerm] = useState("");
  const { data: clients, isPending, error } = useGetClinets();

  const filteredClients = clients?.filter((client: Client) =>
    client.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (isPending) return <ClientsSkeleton />;
  // TODO: add error message view
  if (error) return <ErrorResponsePage error={error} />;

  return (
    <div className="px-4 md:px-16 py-8 w-full">
      <div className="flex justify-between items-center w-full mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold">Clients</h1>
        <NewClient />
      </div>
      <hr className="mt-2" />

      {/* Status Cards Section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 md:grid-cols-3">
        <Card className="flex flex-col items-center text-center">
          <CardHeader className="items-center">
            <FaUsers className="text-4xl text-blue-500 mb-2" />
            <CardTitle>Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{clients.length}</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center text-center">
          <CardHeader className="items-center">
            <FaMoneyBillWave className="text-4xl text-green-500 mb-2" />
            <CardTitle>Money I Owe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ${totalOwedByMe.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center text-center">
          <CardHeader className="items-center">
            <FaMoneyCheckAlt className="text-4xl text-purple-500 mb-2" />
            <CardTitle>Money Owed to Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ${totalOwedToMe.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Clients Section */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <h1 className="text-lg md:text-xl font-semibold mr-4">
            Search Clients
          </h1>
          <div className="relative flex-grow max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-10 py-2 w-full"
            />
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients?.length! > 0 ? (
            filteredClients?.map((client: Client, index: any) => (
              <Link
                to={`/clients/${client._id.$oid}`}
                key={index}
                className="border border-gray-300 p-4 rounded-lg shadow-md bg-white flex flex-col items-center text-center"
              >
                <div className="flex gap-2 flex-col items-center">
                  <img
                    src={client.profilePic || "/user.png"}
                    alt={`${client.username}'s profile`}
                    className="w-24 h-24 rounded-full  object-cover"
                  />
                  <div className="flex justify-start flex-col mt-6">
                    <h2 className="text-xl font-semibold ">
                      {client.username}
                    </h2>
                    <p className="text-gray-600 mt-2 text-sm">
                      {client.company_name}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-1 flex items-center justify-start text-start">
                  <FaPhone className="mr-2 text-blue-500" /> {client.phone}
                </p>

                {client.email && (
                  <p className="text-gray-600 mb-1 flex items-center justify-center">
                    <FaEnvelope className="mr-2 text-green-500" />
                    {client.email}
                  </p>
                )}
              </Link>
            ))
          ) : (
            <p className="text-center col-span-full">No clients found</p>
          )}
        </div>
      </div>
    </div>
  );
}
