import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook that syncs selectedYear state with URL ?ano= search param.
 * When navigating back, the year is preserved in the URL.
 */
export const useYearParam = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const yearFromUrl = searchParams.get('ano') || '';
  const [selectedYear, setSelectedYearInternal] = useState<string>(yearFromUrl);

  const setSelectedYear = useCallback((year: string) => {
    setSelectedYearInternal(year);
    const newParams = new URLSearchParams(searchParams);
    if (year && year !== '') {
      newParams.set('ano', year);
    } else {
      newParams.delete('ano');
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Auto-initialize from URL on mount
  useEffect(() => {
    if (yearFromUrl && yearFromUrl !== selectedYear) {
      setSelectedYearInternal(yearFromUrl);
    }
  }, []);

  return { selectedYear, setSelectedYear };
};
