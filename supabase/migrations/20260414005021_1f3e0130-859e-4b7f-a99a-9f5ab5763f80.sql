CREATE OR REPLACE FUNCTION public.update_emenda_valor_executado()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_emenda_id uuid;
  v_total numeric;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT emenda_id INTO v_emenda_id 
    FROM empresas_licitacao 
    WHERE id = OLD.empresa_id;
  ELSE
    SELECT emenda_id INTO v_emenda_id 
    FROM empresas_licitacao 
    WHERE id = NEW.empresa_id;
  END IF;

  SELECT COALESCE(SUM(p.valor), 0) INTO v_total
  FROM pagamentos p
  JOIN empresas_licitacao e ON e.id = p.empresa_id
  WHERE e.emenda_id = v_emenda_id;

  UPDATE emendas 
  SET valor_executado = v_total,
      valor_liquidado = v_total,
      valor_pago = v_total
  WHERE id = v_emenda_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;