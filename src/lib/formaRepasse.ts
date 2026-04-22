export type FormaRepasseValue = 'transferencia_especial' | 'convenio' | 'fundo_a_fundo';

export const formaRepasseLabels: Record<FormaRepasseValue, string> = {
  transferencia_especial: 'Transferência Especial',
  convenio: 'Convênio',
  fundo_a_fundo: 'Fundo a Fundo',
};

interface EmendaLike {
  forma_repasse?: FormaRepasseValue | string | null;
  especial?: boolean | null;
  numero_convenio?: string | null;
}

/** Retorna a chave normalizada (slug) da forma de repasse. */
export const getFormaRepasseKey = (e: EmendaLike): FormaRepasseValue => {
  if (e.forma_repasse && (e.forma_repasse as FormaRepasseValue) in formaRepasseLabels) {
    return e.forma_repasse as FormaRepasseValue;
  }
  if (e.especial) return 'transferencia_especial';
  if (e.numero_convenio) return 'convenio';
  return 'fundo_a_fundo';
};

/** Retorna o rótulo legível da forma de repasse. */
export const getFormaRepasseLabel = (e: EmendaLike): string => {
  return formaRepasseLabels[getFormaRepasseKey(e)];
};
