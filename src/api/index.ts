import { QueryError } from "@/components/shared/ErrorResponsePage";
import {
  Client,
  Invoice,
  NewClient,
  NewInvoice,
  NewProduct,
  Product,
} from "@/types";
// const baseUrl = import.meta.env.VITE_API_URL;
import { invoke } from "@tauri-apps/api/core";

// ============================================================
// Clinets API Calls
// ============================================================

export async function createNewClient(client: NewClient): Promise<Client> {
  try {
    // Make the Tauri command call
    const data = await invoke<Client>("add_new_client", { client });
    return data;
  } catch (error: any) {
    // Handle error and re-throw as QueryError
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500; // Default to 500 if code is not provided
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}

export async function getAllClients(): Promise<Array<Client>> {
  try {
    const data = await invoke<Array<Client>>("list_all_clients");
    return data;
  } catch (error: any) {
    // Handle error and re-throw as QueryError
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500; // Default to 500 if code is not provided
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}

export async function getCLientById(clientId: string): Promise<Client> {
  console.log(clientId);

  try {
    const data = await invoke<Client>("find_client_by_id", {
      clientId, // Must match the Rust parameter name
    });
    return data;
  } catch (error: any) {
    console.log(error);

    // Handle error and re-throw as QueryError
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500; // Default to 500 if code is not provided
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}

export async function updateCLientById(
  clientId: string,
  updatedClient: NewClient
): Promise<Client> {
  try {
    const updated = await invoke<Client>("update_client", {
      clientId, // Pass the client ID
      updatedFields: updatedClient, // Pass the updated client data
    });
    return updated;
  } catch (error: any) {
    // Handle error and re-throw as QueryError
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500; // Default to 500 if code is not provided
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}

export async function deleteClientById(clientId: string): Promise<string> {
  try {
    const deleted = await invoke<string>("delete_client", {
      clientId,
    });
    return deleted;
  } catch (error: any) {
    // Handle error and re-throw as QueryError
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500; // Default to 500 if code is not provided
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}

// ============================================================
// Product API Calls
// ============================================================

export async function createProudct(product: NewProduct): Promise<Product> {
  try {
    const data = await invoke<Product>("create_product", {
      newProduct: product,
    });
    return data;
  } catch (error: any) {
    // Handle error and re-throw as QueryError
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500; // Default to 500 if code is not provided
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}
export async function deleteProduct(productId: string): Promise<string> {
  try {
    let data = await invoke<string>("delete_product", {
      productId,
    });
    return data;
  } catch (error: any) {
    // Handle error and re-throw as QueryError
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500; // Default to 500 if code is not provided
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}
export async function getAllProducts(): Promise<Product[]> {
  try {
    let data = await invoke<Product[]>("get_all_products");
    return data;
  } catch (error: any) {
    // Handle error and re-throw as QueryError
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500; // Default to 500 if code is not provided
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}
export async function getProductById(productId: string) {
  try {
    let data = await invoke<Product>("get_product_by_id", {
      productId,
    });
    return data;
  } catch (error: any) {
    // Handle error and re-throw as QueryError
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500; // Default to 500 if code is not provided
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}
export async function updateProductById(
  productId: string,
  product: NewProduct
): Promise<Product> {
  try {
    let data = await invoke<Product>("update_product", {
      updatedFields: product,
      productId,
    });
    return data;
  } catch (error: any) {
    // Handle error and re-throw as QueryError
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500; // Default to 500 if code is not provided
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}

export async function createInvoice(newInvoice: NewInvoice): Promise<Invoice> {
  try {
    const data = await invoke<Invoice>("create_invoice", {
      newInvoice,
    });
    console.log(data);

    return data;
  } catch (error: any) {
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500;
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}

export async function deleteInvoice(invoiceId: string): Promise<string> {
  try {
    const data = await invoke<string>("delete_invoice", {
      invoiceId,
    });
    return data;
  } catch (error: any) {
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500;
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}

export async function getAllInvoices(): Promise<Invoice[]> {
  try {
    const data = await invoke<Invoice[]>("list_all_invoices");
    return data;
  } catch (error: any) {
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500;
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice> {
  try {
    const data = await invoke<Invoice>("get_invoice_by_id", {
      invoiceId,
    });
    return data;
  } catch (error: any) {
    console.log(error);

    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500;
    const errorDetails = error.details || null;

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}

export async function updateInvoiceById(
  invoiceId: string,
  updatedFields: Partial<NewInvoice>
): Promise<Invoice> {
  try {
    const data = await invoke<Invoice>("update_invoice_by_id", {
      invoiceId,
      updatedInvoiceDoc: updatedFields,
    });
    console.table({ data, updatedFields });

    return data;
  } catch (error: any) {
    const errorMessage = error.message || "An unknown error occurred";
    const errorCode = error.code || 500;
    const errorDetails = error.details || null;
    console.log(error);

    throw new QueryError(errorMessage, errorCode, errorDetails);
  }
}
