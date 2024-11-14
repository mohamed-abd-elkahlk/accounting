import { useParams } from "react-router-dom";
import { useRef, useState } from "react";
import InvoicePrint from "@/components/shared/InvoicePrint";

const mockInvoices = [
  {
    id: 1,
    invoiceNumber: "INV001",
    date: "2024-01-15",
    dueDate: "2024-02-15",
    username: "John Doe",
    email: "johndoe@example.com",
    phone: "+201011112222",
    companyName: "ABC Corp",
    city: "Cairo",
    address: "123 Nile St, Cairo",
    goods: [
      {
        itemName: "Laptop",
        quantity: 2,
        price: 600,
      },
      {
        itemName: "Laptop",
        quantity: 2,
        price: 600,
      },
      {
        itemName: "Laptop",
        quantity: 2,
        price: 600,
      },
      {
        itemName: "Laptop",
        quantity: 2,
        price: 600,
      },
      {
        itemName: "Laptop",
        quantity: 2,
        price: 600,
      },
      {
        itemName: "Laptop",
        quantity: 2,
        price: 600,
      },
    ],
    totalAmountDue: 1200,
    status: "Paid",
    method: "Credit Card",
  },
  {
    id: 2,
    invoiceNumber: "INV002",
    date: "2024-01-25",
    dueDate: "2024-02-25",
    username: "Jane Smith",
    email: "janesmith@example.com",
    phone: "+201012345678",
    companyName: "XYZ Ltd",
    city: "Alexandria",
    address: "456 Sea Rd, Alexandria",
    goods: [
      {
        itemName: "Phone",
        quantity: 3,
        price: 500,
      },
    ],
    totalAmountDue: 1500,
    status: "Pending",
    method: "Bank Transfer",
  },
  {
    id: 3,
    invoiceNumber: "INV003",
    date: "2024-02-01",
    dueDate: "2024-03-01",
    username: "Ali Hassan",
    email: "alihassan@example.com",
    phone: "+201098765432",
    companyName: "Tech Solutions",
    city: "Giza",
    address: "789 Pyramids Rd, Giza",
    goods: [
      {
        itemName: "Tablet",
        quantity: 4,
        price: 450,
      },
    ],
    totalAmountDue: 1800,
    status: "Overdue",
    method: "PayPal",
  },
];

export default function InvoiceDetails() {
  const { invoicesid } = useParams();
  const foundInvoice = mockInvoices.find(
    (invoice) => invoice.id === parseInt(invoicesid!)
  );

  const [invoice, setInvoice] = useState(foundInvoice);
  const printRef = useRef(null);

  if (!invoice) {
    return <p className="text-center text-red-500">Invoice not found</p>;
  }

  return (
    <div className="mt-6 flex flex-col items-center w-full">
      <div
        ref={printRef}
        className="w-full max-w-screen-2xl bg-white p-6 shadow-lg rounded-lg"
      >
        <InvoicePrint invoice={invoice} />
      </div>
    </div>
  );
}
