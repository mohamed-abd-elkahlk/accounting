import { Client, NewClient } from "@/types";
const baseUrl = import.meta.env.VITE_API_URL;
import { invoke } from "@tauri-apps/api/core";

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
    const data = await invoke<Client>("find_client_by_id", {
      client_id: clientId,
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error; // Re-throw the error for higher-level handling if needed
  }
}

export async function updateCLientById(
  clientId: string,
  updatedClient: Client
): Promise<Client> {
  try {
    const updated = await invoke<Client>("update_client", {
      client_id: clientId, // Pass the client ID
      client: updatedClient, // Pass the updated client data
    });

    return updated;
  } catch (error) {
    console.log(error);
    throw error; // Re-throw the error for higher-level handling if needed
  }
}

export async function deleteClientById(clientId: string): Promise<String> {
  try {
    const deleted = await invoke<String>("delete_client", {
      client_id: clientId,
    });
    return deleted;
  } catch (error) {
    console.log(error);
    throw error; // Re-throw the error for higher-level handling if needed
  }
}
