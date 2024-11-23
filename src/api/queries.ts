import { NewClient, NewProduct, Product } from "@/types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  createNewClient,
  createProudct,
  deleteClientById,
  deleteProduct,
  getAllClients,
  getAllProducts,
  getCLientById,
  getProductById,
  updateCLientById,
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
        queryKey: [QUERY_KEYS.GET_ClINET],
      });
    },
  });
};
export const useUpdateClient = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (client: NewClient) => updateCLientById(clientId, client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ClINET] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_ClINET_BY_ID, clientId],
      });
    },
  });
};
export const useDeleteClient = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteClientById(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ClINET] });
    },
  });
};
export const useGetClinets = () => {
  return useQuery({
    queryFn: () => getAllClients(),
    queryKey: [QUERY_KEYS.GET_ClINET],
  });
};

export const useGetClinetById = (clientId: string) => {
  return useQuery({
    queryFn: () => getCLientById(clientId),
    queryKey: [QUERY_KEYS.GET_ClINET_BY_ID, clientId],
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

export const useDeleteProduct = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_PRODUCT] });
    },
  });
};
