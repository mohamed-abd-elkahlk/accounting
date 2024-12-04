import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/shared/Overview";
import { RecentSales } from "@/components/shared/RecentSales";
import { useLocation } from "react-router-dom";
import { useGetInvoices, useGetProducts, useGetClinets } from "@/api/queries"; // Update with correct path
import { FaDollarSign, FaShoppingCart, FaUserFriends } from "react-icons/fa";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";

export default function DashboardPage() {
  const location = useLocation(); // Fix typo
  if (location.pathname !== "/") return null;

  // Fetch data using your custom hooks
  const { data: invoices = [], isLoading: invoicesLoading } = useGetInvoices();
  const { data: products = [], isLoading: productsLoading } = useGetProducts();
  const { data: clients = [], isLoading: clientsLoading } = useGetClinets();

  // Calculate dynamic values
  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + invoice.totalPrice,
    0
  );
  const totalClients = clients.length;
  const totalProducts = products.length;

  const isLoading = invoicesLoading || productsLoading || clientsLoading;

  return (
    <div className="flex-col md:flex w-full">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <FaDollarSign className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalRevenue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clients</CardTitle>
                  <FaUserFriends className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClients}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Products
                  </CardTitle>
                  <FaShoppingCart className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview invoices={invoices} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made {invoices.length} sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales invoices={invoices} clients={clients} />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
