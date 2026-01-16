import { useState, useMemo, useEffect } from 'react';
import { EmendaDB } from '@/hooks/useEmendas';

export const useYearFilter = (emendas: EmendaDB[] | undefined) => {
  const [selectedYear, setSelectedYear] = useState<string>('');

  const availableYears = useMemo(() => {
    if (!emendas || emendas.length === 0) return [];
    
    const years = new Set<number>();
    emendas.forEach((emenda) => {
      const year = new Date(emenda.data_disponibilizacao).getFullYear();
      years.add(year);
    });
    
    return Array.from(years).sort((a, b) => b - a);
  }, [emendas]);

  // Auto-select the latest year when available years are loaded
  useEffect(() => {
    if (availableYears.length > 0 && selectedYear === '') {
      setSelectedYear(availableYears[0].toString());
    }
  }, [availableYears, selectedYear]);

  const filteredEmendas = useMemo(() => {
    if (!emendas) return [];
    if (selectedYear === 'todos') return emendas;
    
    return emendas.filter((emenda) => {
      const year = new Date(emenda.data_disponibilizacao).getFullYear();
      return year === parseInt(selectedYear);
    });
  }, [emendas, selectedYear]);

  const stats = useMemo(() => {
    const data = filteredEmendas;
    const valorConcedente = data.reduce((acc, e) => acc + Number(e.valor), 0);
    const valorContrapartida = data.reduce((acc, e) => acc + Number(e.contrapartida || 0), 0);
    const valorTotal = valorConcedente + valorContrapartida;

    return {
      totalEmendas: data.length,
      valorConcedente,
      valorTotal,
      valorExecutado: data.reduce((acc, e) => acc + Number(e.valor_executado), 0),
      valorContrapartida,
      emendasPendentes: data.filter((e) => e.status === 'pendente').length,
      emendasAprovadas: data.filter((e) => e.status === 'aprovado').length,
      emendasEmExecucao: data.filter((e) => e.status === 'em_execucao').length,
      emendasConcluidas: data.filter((e) => e.status === 'concluido').length,
    };
  }, [filteredEmendas]);

  return {
    selectedYear,
    setSelectedYear,
    availableYears,
    filteredEmendas,
    stats,
  };
};
