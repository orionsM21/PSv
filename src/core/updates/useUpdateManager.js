import { useCallback, useEffect, useMemo, useState } from 'react';
import { checkForUpdates } from './updateService';

export const useUpdateManager = () => {
  const [state, setState] = useState({
    loading: true,
    updateInfo: null,
    error: '',
  });

  const refresh = useCallback(async () => {
    setState(current => ({ ...current, loading: true }));
    const result = await checkForUpdates(fetch);
    setState({
      loading: false,
      updateInfo: result.data,
      error: result.error,
    });
    return result;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [refresh, state],
  );
};
