import { columns, Item } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import NewStore from "@/components/shared/NewStore";
const data: Item[] = [
  {
    id: "728ed52f",
    amount: 100,
    price: 3000,
    name: "tablet",
  },
  {
    id: "728ed52f",
    amount: 100,
    price: 3000,
    name: "Iphone",
  },
  {
    id: "728ed52f",
    amount: 100,
    price: 3000,
    name: "mobile",
  },
  // ...
];
export default function Sotre() {
  return (
    <div className="px-4 md:px-16 py-8 w-full">
      {/* Header Section */}
      <div className="flex justify-between items-center w-full mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Sotre
        </h1>
        <NewStore />
      </div>
      <hr className="mt-2 mb-6 border-gray-300" />
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
