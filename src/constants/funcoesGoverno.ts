/**
 * Funções de Governo conforme classificação funcional da Lei 4.320/64
 * e Portaria MOG nº 42/1999.
 */
export const FUNCOES_GOVERNO = [
  { codigo: '01', descricao: 'Legislativa' },
  { codigo: '02', descricao: 'Judiciária' },
  { codigo: '03', descricao: 'Essencial à Justiça' },
  { codigo: '04', descricao: 'Administração' },
  { codigo: '05', descricao: 'Defesa Nacional' },
  { codigo: '06', descricao: 'Segurança Pública' },
  { codigo: '07', descricao: 'Relações Exteriores' },
  { codigo: '08', descricao: 'Assistência Social' },
  { codigo: '09', descricao: 'Previdência Social' },
  { codigo: '10', descricao: 'Saúde' },
  { codigo: '11', descricao: 'Trabalho' },
  { codigo: '12', descricao: 'Educação' },
  { codigo: '13', descricao: 'Cultura' },
  { codigo: '14', descricao: 'Direitos da Cidadania' },
  { codigo: '15', descricao: 'Urbanismo' },
  { codigo: '16', descricao: 'Habitação' },
  { codigo: '17', descricao: 'Saneamento' },
  { codigo: '18', descricao: 'Gestão Ambiental' },
  { codigo: '19', descricao: 'Ciência e Tecnologia' },
  { codigo: '20', descricao: 'Agricultura' },
  { codigo: '21', descricao: 'Organização Agrária' },
  { codigo: '22', descricao: 'Indústria' },
  { codigo: '23', descricao: 'Comércio e Serviços' },
  { codigo: '24', descricao: 'Comunicações' },
  { codigo: '25', descricao: 'Energia' },
  { codigo: '26', descricao: 'Transporte' },
  { codigo: '27', descricao: 'Desporto e Lazer' },
  { codigo: '28', descricao: 'Encargos Especiais' },
  { codigo: '99', descricao: 'Reserva de Contingência' },
] as const;

export const getFuncaoGovernoLabel = (value: string): string => {
  const found = FUNCOES_GOVERNO.find(
    (f) => `${f.codigo} - ${f.descricao}` === value || f.codigo === value
  );
  return found ? `${found.codigo} - ${found.descricao}` : value;
};
