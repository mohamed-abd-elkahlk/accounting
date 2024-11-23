import { useNavigate, useParams } from "react-router-dom";
import {
  FaTag,
  FaBox,
  FaDollarSign,
  FaCalendar,
  FaWarehouse,
} from "react-icons/fa";
import { useDeleteProduct, useGetProductByID } from "@/api/queries"; // Mocked query hook
import { formatData } from "@/lib/utils";
import AlertDialogButton from "./AlertDialogButton";
import UpdateProduct from "./UpdateProduct";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function ProductDetails() {
  const { productId } = useParams(); // Extract productId from URL
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    data: product,
    error,
    isError,
    isPending,
  } = useGetProductByID(productId!);

  const {
    data: deleteResponse,
    isError: isProductDeleteError,
    isPending: isProductPending,
    isSuccess: isDeleteSuccess,
    mutate: onDelete,
  } = useDeleteProduct(productId!);

  // Handle success and error for delete operation
  useEffect(() => {
    if (isProductDeleteError) {
      toast({
        variant: "destructive",
        title: "Failed to delete product",
      });
    }
    if (isDeleteSuccess) {
      toast({ variant: "success", title: deleteResponse });
      navigate(-1); // Navigate back
    }
  }, [isProductDeleteError, isDeleteSuccess, deleteResponse, toast, navigate]);

  if (isError) return <div>{error.message}</div>;
  if (isPending) return <div>Loading...</div>;

  // Function to determine badge color based on stock level
  const getStockBadge = (stock: number) => {
    let badgeColor = "bg-gray-200 text-gray-800";
    if (stock > 50) badgeColor = "bg-green-100 text-green-800";
    else if (stock <= 50 && stock > 10)
      badgeColor = "bg-yellow-100 text-yellow-800";
    else if (stock <= 10) badgeColor = "bg-red-100 text-red-800";

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeColor}`}
      >
        {stock > 0 ? `${stock} in stock` : "Out of stock"}
      </span>
    );
  };

  return (
    <div className="px-4 md:px-16 py-8 w-full">
      {/* Header Section */}
      <div className="flex items-center mb-8">
        <img
          src={"/product-placeholder.jpg"} // Replace with product image if available
          alt={product?.name || "Product"}
          className="w-24 h-24 rounded-full mr-6 border border-gray-300 shadow"
        />
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            {product?.name || "Unknown Product"}
            <div className="ml-4">{getStockBadge(product?.stock || 0)}</div>
          </h1>
          <p className="text-gray-600">
            {product?.discription || "No description available"}
          </p>
        </div>
        <div className="flex gap-6 ml-auto">
          {product && <UpdateProduct product={product} />}
          <AlertDialogButton
            isPending={isProductPending}
            onClick={onDelete}
            whatToDelete={product?.name || "product"}
          />
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-blue-600">
            <FaDollarSign className="inline mr-2" /> Price
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            ${product?.price || "N/A"}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-green-600">
            <FaWarehouse className="inline mr-2" /> Stock Level
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {product?.stock || 0}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-yellow-600">
            <FaCalendar className="inline mr-2" /> Last Updated
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {formatData(product?.updated_at?.$date.$numberLong || "")}
          </p>
        </div>
      </div>

      {/* Basic Info Section */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Product Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p>
            <FaTag className="inline mr-2 text-gray-700" />{" "}
            <strong>Product ID:</strong> {product?._id.$oid || "N/A"}
          </p>
          <p>
            <FaBox className="inline mr-2 text-green-600" />{" "}
            <strong>Category:</strong> Electronics{" "}
            {/* Replace with actual category */}
          </p>
          <p>
            <FaCalendar className="inline mr-2 text-blue-500" />{" "}
            <strong>Created At:</strong>{" "}
            {formatData(product?.created_at?.$date.$numberLong || "")}
          </p>
          <p>
            <strong>Description:</strong> {product?.discription || "N/A"}
          </p>
        </div>
      </section>
    </div>
  );
}
