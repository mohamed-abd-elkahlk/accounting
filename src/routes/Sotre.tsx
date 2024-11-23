import { useGetProducts } from "@/api/queries";
import { productColumns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import ErrorResponsePage from "@/components/shared/ErrorResponsePage";
import NewProduct from "@/components/shared/NewProduct";
import StoreSkeleton from "@/components/skeleton/StoreSkeleton";
export default function Sotre() {
  const { data: product, error, isPending } = useGetProducts();
  if (error) return <ErrorResponsePage error={error} />;
  if (isPending) return <StoreSkeleton />;

  return (
    <div className="px-4 md:px-16 py-8 w-full">
      {/* Header Section */}
      <div className="flex justify-between items-center w-full mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Sotre
        </h1>
        <NewProduct />
      </div>
      <hr className="mt-2 mb-6 border-gray-300" />
      <div className="container mx-auto py-10">
        <DataTable columns={productColumns} data={product} />
      </div>
    </div>
  );
}
