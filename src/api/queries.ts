import { NewClient, NewInvoice, NewProduct } from "@/types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  // useInfiniteQuery,
} from "@tanstack/react-query";
import {
  activateClientById,
  createInvoice,
  createNewClient,
  createProudct,
  deactivateClientById,
  getAllClients,
  getAllInvoices,
  getAllProducts,
  getCLientById,
  getInvoiceById,
  getProductById,
  getTheClientInvices,
  updateCLientById,
  updateInvoiceById,
  updateProductById,
} from ".";
import { QUERY_KEYS } from "./qurieskeys";

// ============================================================
// Clinets QUERIES
// ============================================================

export const useCreateNewClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clinet: NewClient) => createNewClient(clinet),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CLIENT],
      });
    },
  });
};

export const useClientAndInvoices = (clientId: string) => {
  const clientQuery = useQuery({
    queryKey: [QUERY_KEYS.GET_ClINET_BY_ID, clientId],
    queryFn: () => getCLientById(clientId),
  });

  const invoicesQuery = useQuery({
    queryKey: [QUERY_KEYS.CLIENT_INVOICES, clientId],
    queryFn: () => getTheClientInvices(clientId),
    enabled: !!clientQuery.data, // Run only if client data is available
  });

  return {
    client: clientQuery.data,
    invoices: invoicesQuery.data,
    isLoading: clientQuery.isLoading || invoicesQuery.isLoading,
    isError: clientQuery.isError || invoicesQuery.isError,
  };
};
export const useUpdateClient = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (client: NewClient) => updateCLientById(clientId, client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CLIENT] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ClINET_BY_ID, clientId],
      });
    },
  });
};
// Hook for deactivating a client
export const useDeactivateClient = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deactivateClientById(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ClINET_BY_ID, clientId],
      });
    },
    onError: (error) => {
      console.error("Failed to deactivate client:", error);
    },
  });
};

// Hook for activating a client
export const useActivateClient = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => activateClientById(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ClINET_BY_ID, clientId],
      });
    },
    onError: (error) => {
      console.error("Failed to activate client:", error);
    },
  });
};
export const useGetClinets = () => {
  return useQuery({
    queryFn: () => getAllClients(),
    queryKey: [QUERY_KEYS.GET_CLIENT],
  });
};

export const useGetClinetById = (clientId: string) => {
  return useQuery({
    queryFn: () => getCLientById(clientId),
    queryKey: [QUERY_KEYS.GET_ClINET_BY_ID, clientId],
    enabled: !!clientId,
  });
};

// ============================================================
// Product QUERIES
// ============================================================

export const useGetProducts = () => {
  return useQuery({
    queryFn: () => getAllProducts(),
    queryKey: [QUERY_KEYS.GET_ALL_PRODUCT],
  });
};

export const useGetProductByID = (productId: string) => {
  return useQuery({
    queryFn: () => getProductById(productId),
    queryKey: [QUERY_KEYS.GET_PRODUCT_BY_ID, productId],
  });
};

export const useUpdateProductByID = (productId: string) => {
  let queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: NewProduct) => updateProductById(productId, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_PRODUCT] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_PRODUCT_BY_ID, productId],
      });
    },
  });
};

export const useCraeteNewProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: NewProduct) => createProudct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_PRODUCT] });
    },
  });
};

// Fetch all invoices
export const useGetInvoices = () => {
  return useQuery({
    queryFn: getAllInvoices,
    queryKey: [QUERY_KEYS.GET_ALL_INVOICES],
  });
};

// Fetch a single invoice by ID
export const useGetInvoiceByID = (invoiceId: string) => {
  return useQuery({
    queryFn: () => getInvoiceById(invoiceId),
    queryKey: [QUERY_KEYS.GET_INVOICE_BY_ID, invoiceId],
  });
};

// Update an invoice by ID
export const useUpdateInvoiceByID = (invoiceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedFields: Partial<NewInvoice>) =>
      updateInvoiceById(invoiceId, updatedFields),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ALL_INVOICES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INVOICE_BY_ID, invoiceId],
      });
    },
  });
};

// Create a new invoice
export const useCreateNewInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newInvoice: NewInvoice) => createInvoice(newInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ALL_INVOICES],
      });
    },
  });
};
