import { useGetProducts } from "@/api/queries";
import { productColumns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import ErrorResponsePage from "@/components/shared/ErrorResponsePage";
import NewProduct from "@/components/shared/NewProduct";
import StoreSkeleton from "@/components/skeleton/StoreSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaBox, FaDollarSign } from "react-icons/fa";

export default function Sotre() {
  const { data: products, error, isPending } = useGetProducts();

  if (error) return <ErrorResponsePage error={error} />;
  if (isPending) return <StoreSkeleton />;

  // Calculate stats
  const totalProducts = products.length;
  const totalProductValue = products.reduce(
    (total, product) => total + product.price * product.stock,
    0
  );

  // Stat cards data
  const productStats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: <FaBox />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Product Value",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(totalProductValue),
      icon: <FaDollarSign />,
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="px-4 md:px-16 py-8 w-full">
      {/* Header Section */}
      <div className="flex justify-between items-center w-full mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Store
        </h1>
        <NewProduct />
      </div>
      <hr className="mt-2 mb-6 border-gray-300" />

      {/* Stats Cards Section */}
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap gap-6 ">
          {productStats.map((stat) => (
            <Card
              key={stat.title}
              className={`shadow-md ${stat.color} rounded-lg w-1/3`}
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

        {/* Product List */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Product List
          </h2>
          <DataTable
            columns={productColumns}
            data={products}
            context="product"
          />
        </div>
      </div>
    </div>
  );
}
