import { Client, NewClient } from "@/types";
const baseUrl = import.meta.env.VITE_API_URL;
import { invoke } from "@tauri-apps/api/core";

export async function createNewClient(client: NewClient): Promise<Client> {
  try {
    // Make the Tauri command call
    const data = await invoke<Client>("add_new_client", { client });
    console.log("Client created successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to create client:", error);
    throw error; // Re-throw the error for higher-level handling if needed
  }
}
export async function getAllClient() {
  try {
    const req = await fetch(`${baseUrl}/clients`);
    return await req.json();
  } catch (error) {
    console.log(error);
  }
}
