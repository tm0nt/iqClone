"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DependencyList,
} from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook genérico para operações assíncronas.
 * Gerencia os estados de loading/error/data eliminando o boilerplate repetido em cada hook.
 *
 * @param fn  Função assíncrona que retorna os dados. Recriada quando deps mudam.
 * @param deps  Dependências que disparam um novo fetch (equivalente ao dep array do useEffect).
 */
export function useAsync<T>(
  fn: () => Promise<T | null>,
  deps: DependencyList,
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      setState({ data: data ?? null, loading: false, error: null });
    } catch (e) {
      setState({
        data: null,
        loading: false,
        error: e instanceof Error ? e.message : "Erro inesperado",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void execute();
  }, [execute]);

  return { ...state, refetch: execute };
}
