import NewInvoice from "@/components/shared/NewInvoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useState } from "react";
import {
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";

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

// Sample invoices data with new fields
const invoices = [
  {
    id: 1,
    invoiceNumber: "INV001",
    date: "2024-01-15",
    dueDate: "2024-02-15",
    amount: 1200,
    status: "Paid",
    username: "John Doe",
    companyName: "Acme Corp",
    address: "123 Main St, Springfield",
  },
  {
    id: 2,
    invoiceNumber: "INV002",
    date: "2024-01-25",
    dueDate: "2024-02-25",
    amount: 1500,
    status: "Pending",
    username: "Jane Smith",
    companyName: "Globex Inc",
    address: "456 Elm St, Metropolis",
  },
  {
    id: 3,
    invoiceNumber: "INV003",
    date: "2024-02-01",
    dueDate: "2024-03-01",
    amount: 1800,
    status: "Overdue",
    username: "Alice Johnson",
    companyName: "Initech",
    address: "789 Oak St, Gotham",
  },
];

export default function Invoices() {
  const [stats] = useState(invoiceStats);

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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Invoice List
          </h2>
          <Table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-left text-gray-600 font-semibold">
                  Invoice
                </TableHead>

                <TableHead className="text-gray-600 font-semibold">
                  Username
                </TableHead>
                <TableHead className="text-gray-600 font-semibold">
                  Company
                </TableHead>
                <TableHead className="text-gray-600 font-semibold">
                  Address
                </TableHead>
                <TableHead className="text-gray-600 font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-right text-gray-600 font-semibold">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="hover:bg-gray-50 border-b border-gray-200"
                >
                  <TableCell className="font-medium text-gray-700">
                    <Link to={`/invoices/${invoice.id}`}>
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>

                  <TableCell className="text-gray-700">
                    <Link to={`/invoices/${invoice.id}`}>
                      {invoice.username}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    <Link to={`/invoices/${invoice.id}`}>
                      {invoice.companyName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    <Link to={`/invoices/${invoice.id}`}>
                      {invoice.address}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/invoices/${invoice.id}`}>
                      <span
                        className={`py-1 px-3 rounded-full text-xs font-semibold ${
                          invoice.status === "Paid"
                            ? "bg-green-100 text-green-600"
                            : invoice.status === "Pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-700">
                    <Link to={`/invoices/${invoice.id}`}>
                      ${invoice.amount.toLocaleString()}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
