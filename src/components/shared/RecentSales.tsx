import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Client, Invoice } from "@/types";

export function RecentSales({
  invoices,
  clients,
}: {
  clients: Client[];
  invoices: Invoice[];
}) {
  // Create a lookup map of client IDs to usernames
  const clientLookup = new Map(
    clients.map((client) => [client._id.$oid, client.username])
  );

  // Get the last 5 invoices
  const recentInvoices = invoices.slice(-5).reverse();

  return (
    <div className="space-y-8">
      {recentInvoices.map((invoice: Invoice, index) => {
        const clientName =
          clientLookup.get(invoice.clientId.$oid) || "Unknown Client";
        const fallbackInitials = clientName
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase();

        return (
          <div key={index} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`/avatars/${index + 1}.png`} alt={clientName} />
              <AvatarFallback>{fallbackInitials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{clientName}</p>
              <p className="text-sm text-muted-foreground">
                Invoice ID: {invoice._id.$oid}
              </p>
            </div>
            <div className="ml-auto font-medium">
              +${invoice.totalPrice.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
