import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./error-page";
import Clinets from "./routes/Clinets";
import ClinetsId from "./routes/ClinetsId";
import Invoices from "./routes/Invoices";
import InvoiceDetails from "./routes/InvoiceDetails";
import Sotre from "./routes/Sotre";
import DashboardPage from "./routes/dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <AppSidebar />
        <DashboardPage />
      </>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: "clients",
        element: <Clinets />,
      },
      {
        path: "clients/:clientsId",
        element: <ClinetsId />,
      },
      {
        path: "invoices",
        element: <Invoices />,
      },
      {
        path: "invoices/:invoicesid",
        element: <InvoiceDetails />,
      },
      {
        path: "stores",
        element: <Sotre />,
      },
    ],
  },
]);
const client = new QueryClient();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <SidebarProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SidebarProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
