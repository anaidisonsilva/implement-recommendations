import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook that syncs selectedYear state with URL ?ano= search param.
 * When navigating back, the year is preserved in the URL.
 */
export const useYearParam = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedYear = searchParams.get('ano') || '';

  const setSelectedYear = useCallback((year: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (year && year !== '') {
      newParams.set('ano', year);
    } else {
      newParams.delete('ano');
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  return { selectedYear, setSelectedYear };
};
