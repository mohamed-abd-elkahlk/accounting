import { useGetInvoices } from "@/api/queries";
import { invoiceColumns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import ErrorResponsePage from "@/components/shared/ErrorResponsePage";
import NewInvoice from "@/components/shared/NewInvoice";
import InvoicesSkeleton from "@/components/skeleton/InvoiceSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

import {
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa";

export default function Invoices() {
  const { data: invoices = [], isPending, error } = useGetInvoices();

  // Memoized stats calculation
  const invoiceStats = useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv) => inv.status === "Paid").length;
    const unpaidInvoices = invoices.filter(
      (inv) => inv.status === "UnPaid"
    ).length;
    const partialPaidInvoices = invoices.filter(
      (inv) => inv.status === "PartialPaid"
    ).length;

    const totalPaid = invoices.reduce((sum, inv) => sum + inv.totalPaid, 0);
    const totalUnpaid = invoices.reduce(
      (sum, inv) => sum + (inv.totalPrice - inv.totalPaid),
      0
    );

    return [
      {
        title: "Total Invoices",
        value: totalInvoices,
        icon: <FaFileInvoiceDollar />,
        color: "bg-blue-100 text-blue-600",
      },
      {
        title: "Paid Invoices",
        value: paidInvoices,
        icon: <FaCheckCircle />,
        color: "bg-green-100 text-green-600",
      },
      {
        title: "Unpaid Invoices",
        value: unpaidInvoices,
        icon: <FaExclamationCircle />,
        color: "bg-red-100 text-red-600",
      },
      {
        title: "Partial Paid Invoices",
        value: partialPaidInvoices,
        icon: <FaClock />,
        color: "bg-yellow-100 text-yellow-600",
      },
      {
        title: "Total Paid",
        value: `$${totalPaid.toFixed(2)}`,
        icon: <FaCheckCircle />,
        color: "bg-green-100 text-green-600",
      },
      {
        title: "Total Unpaid",
        value: `$${totalUnpaid.toFixed(2)}`,
        icon: <FaExclamationCircle />,
        color: "bg-red-100 text-red-600",
      },
    ];
  }, [invoices]);

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
        <div className="flex flex-wrap gap-4">
          {invoiceStats.map((stat) => (
            <Card
              key={stat.title}
              className={`flex-grow flex-shrink-0 basis-[calc(33.33%-1rem)] max-w-full shadow-md ${stat.color} rounded-lg`}
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
