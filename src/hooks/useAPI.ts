import { useState, useEffect } from 'react';

/**
 * Custom hook for API calls with loading and error states
 * Usage:
 * const { data, loading, error, refetch } = useAPI(apiFunction);
 */

interface UseAPIResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAPI<T>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = []
): UseAPIResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Custom hook for API mutations (POST, PUT, DELETE)
 * Usage:
 * const { mutate, loading, error } = useMutation(apiFunction);
 */

interface UseMutationResult<T, P> {
  mutate: (params: P) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export function useMutation<T, P>(
  apiFunction: (id: any, hospitalId: any) => Promise<T>
): UseMutationResult<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (id: any, hospitalId: any): Promise<T | null> => {
    try {
      console.log("Mutation called with params:", hospitalId, id);
      
      setLoading(true);
      setError(null);
      const result = await apiFunction(id,hospitalId);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
}
