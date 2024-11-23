import { Client, NewClient, NewProduct, Product } from "@/types";
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
  } catch (error) {
    console.error("Failed to create client:", error);
    throw error; // Re-throw the error for higher-level handling if needed
  }
}

export async function getAllClients(): Promise<Array<Client>> {
  try {
    const data = await invoke<Array<Client>>("list_all_clients");
    return data;
  } catch (error) {
    console.log(error);
    throw error; // Re-throw the error for higher-level handling if needed
  }
}

export async function getCLientById(clientId: string): Promise<Client> {
  try {
    console.log(clientId);

    const data = await invoke<Client>("find_client_by_id", {
      clientId, // Must match the Rust parameter name
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error; // Re-throw the error for higher-level handling if needed
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
  } catch (error) {
    console.log(error);
    throw error; // Re-throw the error for higher-level handling if needed
  }
}

export async function deleteClientById(clientId: string): Promise<string> {
  try {
    const deleted = await invoke<string>("delete_client", {
      clientId,
    });
    return deleted;
  } catch (error) {
    console.log(error);
    throw error; // Re-throw the error for higher-level handling if needed
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
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function deleteProduct(productId: string): Promise<string> {
  try {
    let data = await invoke<string>("delete_product", {
      productId,
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function getAllProducts(): Promise<Product[]> {
  try {
    let data = await invoke<Product[]>("get_all_products");
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function getProductById(productId: string) {
  try {
    let data = await invoke<Product>("get_product_by_id", {
      productId,
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
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
  } catch (error) {
    console.log(error);
    throw error;
  }
}
