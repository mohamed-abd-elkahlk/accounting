import { Client } from "@/types";
const baseUrl = import.meta.env.VITE_API_URL;
export async function createNewClient(client: Client) {
  try {
    const req = await fetch(`${baseUrl}/clients`, {
      method: "post",
      body: JSON.stringify(client),
      headers: {
        "Content-Type": "application/json;",
      },
    });
    const res = await req.json();
    return res;
  } catch (error) {
    console.log(error);
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
