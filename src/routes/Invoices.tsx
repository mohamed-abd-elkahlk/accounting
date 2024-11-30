import { useGetInvoices } from "@/api/queries";
import { invoiceColumns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import ErrorResponsePage from "@/components/shared/ErrorResponsePage";
import NewInvoice from "@/components/shared/NewInvoice";
import InvoicesSkeleton from "@/components/skeleton/InvoiceSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useState } from "react";
import {
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa";

// Invoice stats data
const invoiceStats = [
  {
    title: "Total Invoices",
    value: 120,
    icon: <FaFileInvoiceDollar />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Paid Invoices",
    value: 80,
    icon: <FaCheckCircle />,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Pending Invoices",
    value: 30,
    icon: <FaClock />,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Overdue Invoices",
    value: 10,
    icon: <FaExclamationCircle />,
    color: "bg-red-100 text-red-600",
  },
];

export default function Invoices() {
  const [stats] = useState(invoiceStats);
  const { data: invoices, isPending, error } = useGetInvoices();

  if (isPending) {
    return <InvoicesSkeleton />;
  }
  if (error) {
    return <ErrorResponsePage error={error} />;
  }
  return (
    <div className="px-4 md:px-16 py-8 w-full">
      {/* Header Section */}
      <div className="flex justify-between items-center w-full mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Invoices
        </h1>
        <NewInvoice />
      </div>
      <hr className="mt-2 mb-6 border-gray-300" />

      {/* Status Cards Section */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className={`shadow-md ${stat.color} rounded-lg`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-lg font-semibold">{stat.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-center">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Invoice List */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Invoice List
          </h2>
          <DataTable
            columns={invoiceColumns}
            data={invoices}
            context="invoice"
          />
        </div>
      </div>
    </div>
  );
}
