import { useParams } from "react-router-dom";
import InvoicePrint from "@/components/shared/InvoicePrint";
import { useGetClinetById, useGetInvoiceByID } from "@/api/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  FaUser,
  FaRegCalendarAlt,
  FaBox,
  FaDollarSign,
  FaFileInvoice,
} from "react-icons/fa";
import ErrorResponsePage from "@/components/shared/ErrorResponsePage";
import InvoiceDetailsSkeleton from "@/components/skeleton/InvoiceDetailsSkeleton";
import ClinetCardInfo from "@/components/shared/ClinetCardInfo";
import InvoiceUpdate from "@/components/shared/InvoiceUpdate";

export default function InvoiceDetails() {
  const { invoiceId } = useParams();
  const {
    data: invoice,
    isLoading: isInvoiceLoading,
    error: invoiceError,
  } = useGetInvoiceByID(invoiceId!);

  const clientId = invoice?.clientId?.$oid;
  console.log(invoice);

  // Handle loading states
  if (isInvoiceLoading) {
    return <InvoiceDetailsSkeleton />;
  }

  // Handle errors
  if (invoiceError) {
    return <ErrorResponsePage error={invoiceError} />;
  }
  if (!invoice) {
    return <p>Invoice not found</p>;
  }
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <span className="text-white bg-green-500 px-3 py-1 rounded-full text-sm shadow-sm">
            Paid
          </span>
        );
      case "UnPaid":
        return (
          <span className="text-white bg-red-500 px-3 py-1 rounded-full text-sm shadow-sm">
            UnPaid
          </span>
        );
      case "PartialPaid":
        return (
          <span className="text-white bg-yellow-500 px-3 py-1 rounded-full text-sm shadow-sm">
            Partial Paid
          </span>
        );
      default:
        return (
          <span className="text-white bg-gray-500 px-3 py-1 rounded-full text-sm shadow-sm">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center w-full px-4 space-y-6">
      {/* Invoice Header */}
      <Card className="w-full max-w-screen-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center flex items-center justify-between text-gray-800">
            <div className="flex gap-3">
              <FaFileInvoice className="mr-3 text-blue-500" /> Invoice Details
            </div>
            {/* Print and Update Button */}
            <div className="flex items-center gap-3">
              {/* <InvoicePrint invoice={invoice} /> */}
              <InvoiceUpdate invoice={invoice} />
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Top Section: Summary and Client Info */}
      <div className="w-full max-w-screen-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Summary */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center text-gray-700">
              <FaDollarSign className="mr-2 text-green-500" /> Invoice Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              <strong>Status:</strong> {renderStatusBadge(invoice.status)}
            </p>
            <p className="text-gray-600">
              <strong>Total Amount:</strong> ${invoice.totalPrice}
            </p>
            <p className="text-gray-600">
              <strong>Total Paid:</strong> ${invoice.totalPaid}
            </p>
            <p className="text-gray-600">
              <strong>Outstanding Balance:</strong> $
              {invoice.totalPrice - invoice.totalPaid}
            </p>
          </CardContent>
        </Card>

        {clientId && <ClinetCardInfo clientId={clientId} />}
      </div>

      {/* Products Section */}
      <Card className="w-full max-w-screen-2xl shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center text-gray-700">
            <FaBox className="mr-2 text-orange-500" /> Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="border border-gray-200 rounded-lg shadow">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableCell className="font-bold text-gray-700">
                  Product Name
                </TableCell>

                <TableCell className="font-bold text-gray-700 text-right">
                  Price
                </TableCell>
                <TableCell className="font-bold text-gray-700 text-right">
                  Quantity
                </TableCell>
                <TableCell className="font-bold text-gray-700 text-right">
                  Total Price
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.goods.map((product, index) => (
                <TableRow
                  key={index}
                  className={`hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <TableCell>{product.name}</TableCell>

                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    ${(product.price * product.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Summary Section */}
          <div className="flex flex-col items-end mt-4 space-y-2">
            <p className="text-gray-700">
              <strong>Total Quantity:</strong>{" "}
              {invoice.goods.reduce(
                (total, product) => total + product.quantity,
                0
              )}
            </p>
            <p className="text-gray-700">
              <strong>Total Invoice Amount:</strong> $
              {invoice.goods
                .reduce(
                  (total, product) => total + product.price * product.quantity,
                  0
                )
                .toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dates Section */}
      <Card className="w-full max-w-screen-2xl shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center text-gray-700">
            <FaRegCalendarAlt className="mr-2 text-yellow-500" /> Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            <strong>Created At:</strong>{" "}
            {new Date(
              Number(invoice?.created_at?.$date.$numberLong)
            ).toLocaleString()}
          </p>
          <p className="text-gray-600">
            <strong>Updated At:</strong>{" "}
            {new Date(
              Number(invoice?.updated_at?.$date.$numberLong)
            ).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
