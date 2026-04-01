import { useEffect, useState } from "react";
import type { DependencyList } from "react";

export function useQuery<T>(queryFn: () => Promise<T>, deps: DependencyList): { data: T | undefined; loading: boolean; error: string | null } {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    queryFn()
      .then((result) => {
        if (mounted) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Query failed");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, deps);

  return { data, loading, error };
}
