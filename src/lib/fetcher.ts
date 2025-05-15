// utils/useFetch.ts
import useSWR, { SWRConfiguration } from "swr";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Fetch Wrapper Function
export const fetcher = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  return response.json();
};

// Custom useFetch Hook
export function useFetch<T>(
  url: string,
  options?: SWRConfiguration & { fetchOptions?: RequestInit }
) {
  const { fetchOptions, ...swrOptions } = options || {};

  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    (url) => fetcher<T>(url, fetchOptions),
    {
      revalidateOnFocus: true, // Refetch on window focus
      revalidateOnReconnect: true, // Refetch on network reconnect
      ...swrOptions,
    }
  );

  return { data, error, isLoading, mutate };
}
